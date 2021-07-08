import events from 'events';
import { encode } from 'querystring';
import { Inflate, constants, createInflate } from 'zlib';
import WebSocket from 'ws';
import {
	GatewayVersion,
	GatewayDispatchEvents,
	GatewayOPCodes,
	GatewayReceivePayload,
	GatewaySendPayload,
} from 'discord-api-types/gateway/v8';
import { Client, Exception, GatewayException, Events, WebSocketStatus, WebSocketManager, Snowflake } from '..';

let erlpack: typeof import('@typescord/erlpack') | undefined;
try {
	// eslint-disable-next-line unicorn/prefer-module
	erlpack = require('@typescord/erlpack');
	// eslint-disable-next-line no-empty
} catch {}

const ZLIB_SUFFIX = 0xff_ff;

export const enum WebSocketEvents {
	Close = 'close',
	Destroyed = 'destroyed',
	InvalidSession = 'invalidSession',
	Ready = 'ready',
	Resumed = 'resumed',
}

type GatewayUrlQuery = {
	v: typeof GatewayVersion;
	encoding?: typeof encoding;
	compress?: 'zlib-stream';
};

export const encoding = erlpack ? 'etf' : 'json';

const pack = erlpack ? erlpack.pack : JSON.stringify;
const unpack = erlpack ? erlpack.unpack : JSON.parse;

interface NodeEventTarget {
	once(event: string | symbol, listener: (...args: unknown[]) => void): this;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function once(emitter: NodeEventTarget, name: string, signal: AbortSignal): Promise<any> {
	return events.once(emitter, name, { signal }).then(([arg]) => arg);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rejectOnce(emitter: NodeEventTarget, name: string, signal: AbortSignal): Promise<any> {
	return events.once(emitter, name, { signal }).then(([arg]) => Promise.reject(arg));
}

interface RateLimit {
	queue: GatewaySendPayload[];
	limit: number;
	remaining: number;
	time: number;
	timer?: NodeJS.Timeout;
}

export class WebSocketClient extends events.EventEmitter {
	private connection?: WebSocket;
	private expectedGuilds?: Set<Snowflake>;
	private readonly rateLimit: RateLimit;

	private lastHeartbeatAcked = true;
	private heartbeatInterval?: NodeJS.Timeout;
	private helloTimeout?: NodeJS.Timeout;
	private readyTimeout?: NodeJS.Timeout;
	private lastPingTimestamp = -1;
	private sequence = -1;
	private closeSequence = 0;
	private chunks?: Buffer[];
	private inflate?: Inflate;
	private readonly compress: boolean;

	public readonly client: Client;
	public ping = -1;
	public status = WebSocketStatus.Idle;
	public eventsAttached = false;
	public sessionId?: string;
	public connectedAt?: number;

	public constructor(public readonly manager: WebSocketManager) {
		super();
		this.client = manager.client;
		this.compress = this.client.options.ws.compress;
		this.rateLimit = {
			queue: [],
			...this.client.options.ws.rateLimit,
			remaining: this.client.options.ws.rateLimit.limit,
		};
	}

	public async connect(): Promise<void> {
		if (this.connection?.readyState === WebSocket.OPEN) {
			return this.status === WebSocketStatus.Ready ? undefined : this.identify();
		}

		if (this.connection) {
			this.destroy();
		}

		const gatewayOptions: GatewayUrlQuery = {
			v: GatewayVersion,
			encoding,
		};

		if (this.compress) {
			this.chunks = [];
			this.inflate = createInflate({ flush: constants.Z_SYNC_FLUSH, chunkSize: 0xff_ff })
				.on('data', (chunk) => this.chunks!.push(chunk))
				.on('error', (error) => this.emit(Events.GatewayError, error));
			gatewayOptions.compress = 'zlib-stream';
		}

		this.status =
			this.status === WebSocketStatus.Disconnected ? WebSocketStatus.Reconnecting : WebSocketStatus.Connecting;
		// reset hello timeout
		this.updateHelloTimeout(true);

		this.connection = new WebSocket(`${this.manager.gatewayUrl}?${encode(gatewayOptions)}`, {
			perMessageDeflate: false,
		});

		this.connection.on('open', this.onOpen.bind(this));
		this.connection.on('message', this.onMessage.bind(this));
		this.connection.on('error', this.onError.bind(this));
		this.connection.on('close', this.onClose.bind(this));

		const ac = new AbortController();
		return Promise.race<void>([
			once(this, WebSocketEvents.Ready, ac.signal),
			once(this, WebSocketEvents.Resumed, ac.signal),
			rejectOnce(this, WebSocketEvents.Close, ac.signal),
			rejectOnce(this, WebSocketEvents.InvalidSession, ac.signal),
			rejectOnce(this, WebSocketEvents.Destroyed, ac.signal),
		]).finally(() => ac.abort());
	}

	private onOpen(): void {
		this.connectedAt = Date.now();
		this.status = WebSocketStatus.Nearly;
	}

	private async onMessage(data: string | Buffer): Promise<void> {
		let packet = data;

		if (this.inflate && data instanceof Buffer) {
			this.inflate.write(data);

			if (data.readUInt32BE(data.length - 4) !== ZLIB_SUFFIX) {
				return;
			}

			packet = await new Promise((resolve) => {
				this.inflate!.flush(() => {
					resolve(Buffer.concat(this.chunks!));
					this.chunks = [];
				});
			});

			// If an error occurs during inflation, packet will be empty.
			// Inflation errors are already handled.
			if (packet.length === 0) {
				return;
			}
		}

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.onPacket(unpack(packet as any));
		} catch (error) {
			this.client.emit(Events.GatewayError, error);
		}
	}

	private onError(error?: Error) {
		if (!error) {
			return;
		}

		this.client.emit(Events.GatewayError, error);
	}

	private onClose(code: number, message: string) {
		this.chunks = undefined;
		if (this.inflate) {
			this.inflate.close();
			this.inflate = undefined;
		}

		if (this.sequence !== -1) {
			this.closeSequence = this.sequence;
		}
		this.sequence = -1;

		this.updateHeartbeatTimer(-1);
		this.updateHelloTimeout();

		if (this.connection) {
			this.cleanupConnection();
		}

		this.status = WebSocketStatus.Disconnected;
		this.emit(WebSocketEvents.Close, new GatewayException(code, message));
	}

	private onPacket(packet: GatewayReceivePayload): void {
		this.client.emit(Events.Raw, packet);

		if ('t' in packet) {
			if (packet.t === GatewayDispatchEvents.Ready) {
				this.emit(WebSocketEvents.Resumed);

				this.sessionId = packet.d.session_id;
				this.expectedGuilds = new Set(packet.d.guilds.map((guild) => guild.id));
				this.status = WebSocketStatus.WaitingForGuilds;
				this.lastHeartbeatAcked = true;

				this.sendHeartbeat();
			} else if (packet.t === GatewayDispatchEvents.Resumed) {
				this.emit(WebSocketEvents.Resumed);

				this.status = WebSocketStatus.Ready;
				this.lastHeartbeatAcked = true;

				this.sendHeartbeat();
			}
		}

		if ('s' in packet && packet.s > this.sequence) {
			this.sequence = packet.s;
		}

		switch (packet.op) {
			case GatewayOPCodes.Hello:
				this.updateHelloTimeout();
				this.updateHeartbeatTimer(packet.d.heartbeat_interval);
				this.identify();
				break;

			case GatewayOPCodes.Reconnect:
				this.destroy({ closeCode: 4000 });
				break;

			case GatewayOPCodes.InvalidSession:
				if (packet.d) {
					this.identifyResume();
					return;
				}

				this.sequence = -1;
				this.sessionId = undefined;
				this.status = WebSocketStatus.Reconnecting;
				this.emit(WebSocketEvents.InvalidSession);
				break;

			case GatewayOPCodes.HeartbeatAck:
				this.lastHeartbeatAcked = true;
				this.ping = Date.now() - this.lastPingTimestamp;
				break;

			case GatewayOPCodes.Heartbeat:
				this.sendHeartbeat();
				break;

			default:
				this.manager.handlePacket(packet);

				if (this.status === WebSocketStatus.WaitingForGuilds && packet.t === GatewayDispatchEvents.GuildCreate) {
					this.expectedGuilds?.delete(packet.d.id);
					this.checkReady();
				}
		}
	}

	private checkReady() {
		if (this.readyTimeout) {
			clearTimeout(this.readyTimeout);
			this.readyTimeout = undefined;
		}

		if (!this.expectedGuilds?.size) {
			this.status = WebSocketStatus.Ready;
			this.emit(WebSocketEvents.Ready);
			return;
		}

		this.readyTimeout = setTimeout(() => {
			this.readyTimeout = undefined;
			this.status = WebSocketStatus.Ready;
			this.emit(WebSocketEvents.Ready, this.expectedGuilds);
		}, 15_000);
	}

	private updateHelloTimeout(reset = true) {
		if (this.client.options.ws.helloTimeout === Infinity) {
			return;
		}

		if (reset) {
			if (this.helloTimeout) {
				clearTimeout(this.helloTimeout);
				this.helloTimeout = undefined;
			}
			return;
		}

		this.helloTimeout = setTimeout(() => {
			this.destroy({ reset: true, closeCode: 4009 });
		}, this.client.options.ws.helloTimeout);
	}

	private updateHeartbeatTimer(time: number) {
		if (time === -1) {
			if (this.heartbeatInterval) {
				clearInterval(this.heartbeatInterval);
				this.heartbeatInterval = undefined;
			}
			return;
		}

		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}

		this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), time);
	}

	private sendHeartbeat(): void {
		if (!this.lastHeartbeatAcked) {
			this.destroy({ closeCode: 4009, reset: true });
			return;
		}

		this.lastHeartbeatAcked = false;
		this.lastPingTimestamp = Date.now();

		this.send({ op: GatewayOPCodes.Heartbeat, d: this.sequence });
	}

	private identify(): void {
		return this.sessionId ? this.identifyResume() : this.identifyNew();
	}

	private identifyNew(): void {
		if (!this.client.token) {
			throw new Exception('TOKEN_MISSING');
		}

		this.status = WebSocketStatus.Identifying;

		this.send({
			op: GatewayOPCodes.Identify,
			d: {
				properties: {
					$os: process.platform,
					$browser: 'typescord',
					$device: 'typescord',
				},
				compress: this.compress,
				large_threshold: this.client.options.ws.largeThreshold,
				token: this.client.token,
				intents: this.client.options.intents,
			},
		});
	}

	private identifyResume(): void {
		if (!this.client.token) {
			throw new Exception('TOKEN_MISSING');
		}

		if (!this.sessionId) {
			this.identifyNew();
			return;
		}

		this.status = WebSocketStatus.Resuming;

		this.send({
			op: GatewayOPCodes.Resume,
			d: {
				token: this.client.token,
				session_id: this.sessionId,
				seq: this.closeSequence,
			},
		});
	}

	public send(data: GatewaySendPayload, important = true): void {
		if (important) {
			this.rateLimit.queue.push(data);
		} else {
			this.rateLimit.queue.unshift(data);
		}

		this.processQueue();
	}

	private processQueue(): void {
		if (this.rateLimit.remaining === 0 || this.rateLimit.queue.length === 0) {
			return;
		}

		if (this.rateLimit.remaining === this.rateLimit.limit) {
			this.rateLimit.timer = setTimeout(() => {
				this.rateLimit.remaining = this.rateLimit.limit;
				this.processQueue();
			}, this.rateLimit.time);
		}

		for (; this.rateLimit.remaining > 0; this.rateLimit.remaining--) {
			const item = this.rateLimit.queue.shift();
			if (!item) {
				return;
			}

			if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
				this.destroy({ closeCode: 4000 });
				return;
			}

			this.connection.send(pack(item), (error) => error && this.client.emit(Events.GatewayError, error));
		}
	}

	public destroy({ closeCode = 1000, reset = false, emit = true } = {}): void {
		this.chunks = undefined;
		if (this.inflate) {
			this.inflate.close();
			this.inflate = undefined;
		}

		this.updateHeartbeatTimer(-1);
		this.updateHelloTimeout();

		if (this.connection) {
			if (this.connection.readyState === WebSocket.OPEN) {
				this.connection.close(closeCode);
			} else {
				this.cleanupConnection();
				try {
					this.connection.close(closeCode);
					// eslint-disable-next-line no-empty
				} catch {}

				if (emit) {
					this.emit(WebSocketEvents.Destroyed);
				}
			}
		} else if (emit) {
			this.emit(WebSocketEvents.Destroyed);
		}

		this.connection = undefined;
		this.status = WebSocketStatus.Disconnected;

		if (this.sequence !== -1) {
			this.closeSequence = this.sequence;
		}

		if (reset) {
			this.sequence = -1;
			this.sessionId = undefined;
		}

		this.rateLimit.remaining = this.rateLimit.limit;
		this.rateLimit.queue = [];

		if (this.rateLimit.timer) {
			clearTimeout(this.rateLimit.timer);
			this.rateLimit.timer = undefined;
		}
	}

	private cleanupConnection(): void {
		if (!this.connection) {
			return;
		}
		this.connection.removeAllListeners('open');
		this.connection.removeAllListeners('message');
		this.connection.removeAllListeners('close');
		this.connection.removeAllListeners('error');
	}
}
