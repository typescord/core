import events from 'events';
import { encode } from 'querystring';
import { Inflate, constants, createInflate } from 'zlib';
import {
	GatewayDispatchEvents,
	GatewayOPCodes,
	GatewayReceivePayload,
	GatewaySendPayload,
	Snowflake,
} from 'discord-api-types';
import WebSocket from 'ws';
import { Client } from '../clients';
import { Exception, GatewayException } from '../exceptions';
import { Events } from './Events';
import { Status, WebSocketManager } from './WebSocketManager';

let erlpack: typeof import('@typescord/erlpack') | undefined;
try {
	// eslint-disable-next-line unicorn/prefer-module
	erlpack = require('@typescord/erlpack');
	// eslint-disable-next-line no-empty
} catch {}

const ZLIB_SUFFIX = 0xffff;

const encoding = erlpack ? 'etf' : 'json';

export const enum WebSocketEvents {
	Close = 'close',
	Destroyed = 'destroyed',
	InvalidSession = 'invalidSession',
	Ready = 'ready',
	Resumed = 'resumed',
}

type GatewayURLQuery = {
	v: number;
	encoding?: typeof encoding;
	compress?: 'zlib-stream';
};

const pack = erlpack ? erlpack.pack : JSON.stringify;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unpack: (data: Buffer) => any = erlpack ? erlpack.unpack : (data: Buffer) => JSON.parse(data.toString('utf8'));

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

	public readonly client: Client;
	public ping = -1;
	public status = Status.Idle;
	public eventsAttached = false;
	public sessionId?: string;
	public connectedAt?: number;

	public constructor(public readonly manager: WebSocketManager) {
		super();
		this.client = manager.client;
		this.rateLimit = {
			queue: [],
			...this.client.options.ws.rateLimit,
			remaining: this.client.options.ws.rateLimit.limit,
		};
	}

	public async connect(): Promise<void> {
		if (this.connection?.readyState === WebSocket.OPEN) {
			return this.status === Status.Ready ? undefined : this.identify();
		}

		if (this.connection) {
			this.destroy();
		}

		const gatewayOptions: GatewayURLQuery = {
			v: this.client.options.ws.version,
			encoding,
		};

		if (this.client.options.ws.zlib) {
			this.chunks = [];
			this.inflate = createInflate({ flush: constants.Z_SYNC_FLUSH, chunkSize: 0xffff }).on('data', (chunk) =>
				this.chunks!.push(chunk),
			);
			gatewayOptions.compress = 'zlib-stream';
		}

		this.status = this.status === Status.Disconnected ? Status.Reconnecting : Status.Connecting;
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
		this.status = Status.Nearly;
	}

	private async onMessage(data: string | Buffer): Promise<void> {
		let packet = data;

		if (this.client.options.ws.zlib) {
			if (!this.inflate) {
				this.inflate = createInflate({ flush: constants.Z_SYNC_FLUSH, chunkSize: 0xffff }).on('data', (chunk) =>
					this.chunks!.push(chunk),
				);
			}

			this.inflate.write(data);
			if ((data as Buffer).readUInt32BE(data.length - 4) !== ZLIB_SUFFIX) {
				return;
			}

			packet = await new Promise((resolve, reject) => {
				this.inflate!.once('error', (error) => {
					this.inflate = undefined;
					reject(error);
				}).flush(() => {
					this.inflate!.removeListener('error', reject);
					resolve(Buffer.concat(this.chunks!));
				});
			});
			this.chunks = [];
		}

		try {
			this.onPacket(unpack(packet as Buffer));
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

		this.status = Status.Disconnected;
		this.emit(WebSocketEvents.Close, new GatewayException(code, message));
	}

	private onPacket(packet: GatewayReceivePayload): void {
		this.client.emit(Events.Raw, packet);

		if ('t' in packet) {
			if (packet.t === GatewayDispatchEvents.Ready) {
				this.emit(WebSocketEvents.Resumed);

				this.sessionId = packet.d.session_id;
				this.expectedGuilds = new Set(packet.d.guilds.map((guild) => guild.id));
				this.status = Status.WaitingForGuilds;
				this.lastHeartbeatAcked = true;

				this.sendHeartbeat();
			} else if (packet.t === GatewayDispatchEvents.Resumed) {
				this.emit(WebSocketEvents.Resumed);

				this.status = Status.Ready;
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
				this.status = Status.Reconnecting;
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

				if (this.status === Status.WaitingForGuilds && packet.t === GatewayDispatchEvents.GuildCreate) {
					this.expectedGuilds?.delete(packet.d.id);
					this.checkReady();
				}
		}
	}

	private checkReady() {
		if (this.readyTimeout) {
			this.client.clearTimeout(this.readyTimeout);
			this.readyTimeout = undefined;
		}

		if (!this.expectedGuilds?.size) {
			this.status = Status.Ready;
			this.emit(WebSocketEvents.Ready);
			return;
		}

		this.readyTimeout = this.client.setTimeout(() => {
			this.readyTimeout = undefined;
			this.status = Status.Ready;
			this.emit(WebSocketEvents.Ready, this.expectedGuilds);
		}, 15000);
	}

	private updateHelloTimeout(reset = true) {
		if (this.client.options.ws.helloTimeout === Infinity) {
			return;
		}

		if (reset) {
			if (this.helloTimeout) {
				this.client.clearTimeout(this.helloTimeout);
				this.helloTimeout = undefined;
			}
			return;
		}

		this.helloTimeout = this.client.setTimeout(() => {
			this.destroy({ reset: true, closeCode: 4009 });
		}, this.client.options.ws.helloTimeout);
	}

	private updateHeartbeatTimer(time: number) {
		if (time === -1) {
			if (this.heartbeatInterval) {
				this.client.clearInterval(this.heartbeatInterval);
				this.heartbeatInterval = undefined;
			}
			return;
		}

		if (this.heartbeatInterval) {
			this.client.clearInterval(this.heartbeatInterval);
		}

		this.heartbeatInterval = this.client.setInterval(() => this.sendHeartbeat(), time);
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

		this.status = Status.Identifying;

		this.send({
			op: GatewayOPCodes.Identify,
			d: {
				properties: {
					$os: process.platform,
					$browser: 'typescord',
					$device: 'typescord',
				},
				compress: this.client.options.ws.zlib,
				large_threshold: this.client.options.ws.largeThreshold,
				token: this.client.token,
				intents: this.client.options.ws.intents,
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

		this.status = Status.Resuming;

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
			this.rateLimit.timer = this.client.setTimeout(() => {
				this.rateLimit.remaining = this.rateLimit.limit;
				this.processQueue();
			}, this.rateLimit.time);
		}

		while (this.rateLimit.remaining > 0) {
			const item = this.rateLimit.queue.shift();
			if (!item) {
				return;
			}

			if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
				this.destroy({ closeCode: 4000 });
				return;
			}

			this.connection.send(pack(item), (error) => error && this.client.emit(Events.GatewayError, error));
			this.rateLimit.remaining--;
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
		this.status = Status.Disconnected;

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
			this.client.clearTimeout(this.rateLimit.timer);
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
