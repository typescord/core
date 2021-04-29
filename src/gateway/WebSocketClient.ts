import { EventEmitter } from 'events';
import { encode } from 'querystring';
import { Inflate, constants, createInflate } from 'zlib';
import WebSocket, { CloseEvent, ErrorEvent } from 'ws';
import {
	GatewayDispatchEvents,
	GatewayOPCodes,
	GatewayReceivePayload,
	GatewaySendPayload,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../clients';
import { once, rejectOnce } from '../utils/events';
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
	CLOSE = 'close',
	DESTROYED = 'destroyed',
	INVALID_SESSION = 'invalidSession',
	READY = 'ready',
	RESUMED = 'resumed',
}

type GatewayURLQuery = {
	v: number;
	encoding?: typeof encoding;
	compress?: 'zlib-stream';
};

const pack = erlpack ? erlpack.pack : JSON.stringify;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unpack: (data: Buffer) => any = erlpack ? erlpack.unpack : (data: Buffer) => JSON.parse(data.toString('utf8'));

interface RateLimit {
	queue: GatewaySendPayload[];
	limit: number;
	remaining: number;
	time: number;
	timer?: NodeJS.Timeout;
}

export class WebSocketClient extends EventEmitter {
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
	public status = Status.IDLE;
	public eventsAttached = false;
	public sessionId?: string;
	public connectedAt?: number;

	public constructor(public readonly manager: WebSocketManager) {
		super();
		this.client = manager.client;
		this.rateLimit = {
			queue: [],
			...this.client.options.ws.rateLimits,
			remaining: this.client.options.ws.rateLimits.limit,
		};
	}

	public async connect(): Promise<void> {
		if (this.connection?.readyState === WebSocket.OPEN) {
			return this.status === Status.READY ? undefined : this.identify();
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

		this.status = this.status === Status.DISCONNECTED ? Status.RECONNECTING : Status.CONNECTING;
		this.setHelloTimeout();

		this.connection = new WebSocket(`${this.manager.gateway}?${encode(gatewayOptions)}`, {
			perMessageDeflate: false,
		});

		this.connection.on('open', this.onOpen.bind(this));
		this.connection.on('message', this.onMessage.bind(this));
		this.connection.on('error', this.onError.bind(this));
		this.connection.on('close', this.onClose.bind(this));

		const ac = new AbortController();
		return Promise.race<void>([
			once(this, WebSocketEvents.READY, ac.signal),
			once(this, WebSocketEvents.RESUMED, ac.signal),
			rejectOnce(this, WebSocketEvents.CLOSE, ac.signal),
			rejectOnce(this, WebSocketEvents.INVALID_SESSION, ac.signal),
			rejectOnce(this, WebSocketEvents.DESTROYED, ac.signal),
		]).finally(ac.abort);
	}

	private onOpen(): void {
		this.connectedAt = Date.now();
		this.status = Status.NEARLY;
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
			this.client.emit(Events.GATEWAY_ERROR, error);
		}
	}

	private onError(event: ErrorEvent) {
		if (!event.error) {
			return;
		}

		this.client.emit(Events.GATEWAY_ERROR, event.error);
	}

	private onClose(event: CloseEvent) {
		this.chunks = undefined;
		if (this.inflate) {
			this.inflate.close();
			this.inflate = undefined;
		}

		if (this.sequence !== -1) {
			this.closeSequence = this.sequence;
		}
		this.sequence = -1;

		this.setHeartbeatTimer(-1);
		this.setHelloTimeout(true);

		if (this.connection) {
			this.cleanupConnection();
		}

		this.status = Status.DISCONNECTED;
		this.emit(WebSocketEvents.CLOSE, event);
	}

	private onPacket(packet: GatewayReceivePayload): void {
		this.client.emit(Events.RAW, packet);

		if ('t' in packet) {
			if (packet.t === GatewayDispatchEvents.Ready) {
				this.emit(WebSocketEvents.RESUMED);

				this.sessionId = packet.d.session_id;
				this.expectedGuilds = new Set(packet.d.guilds.map((guild) => guild.id));
				this.status = Status.WAITING_FOR_GUILDS;
				this.lastHeartbeatAcked = true;

				this.sendHeartbeat();
			} else if (packet.t === GatewayDispatchEvents.Resumed) {
				this.emit(WebSocketEvents.RESUMED);

				this.status = Status.READY;
				this.lastHeartbeatAcked = true;

				this.sendHeartbeat();
			}
		}

		if ('s' in packet && packet.s > this.sequence) {
			this.sequence = packet.s;
		}

		switch (packet.op) {
			case GatewayOPCodes.Hello:
				this.setHelloTimeout(true);
				this.setHeartbeatTimer(packet.d.heartbeat_interval);
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
				this.status = Status.RECONNECTING;
				this.emit(WebSocketEvents.INVALID_SESSION);
				break;

			case GatewayOPCodes.HeartbeatAck:
				this.ackHeartbeat();
				break;

			case GatewayOPCodes.Heartbeat:
				this.sendHeartbeat();
				break;

			default:
				this.manager.handlePacket(packet);

				if (this.status === Status.WAITING_FOR_GUILDS && packet.t === GatewayDispatchEvents.GuildCreate) {
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
			this.status = Status.READY;
			this.emit(WebSocketEvents.READY);
			return;
		}

		this.readyTimeout = this.client.setTimeout(() => {
			this.readyTimeout = undefined;
			this.status = Status.READY;
			this.emit(WebSocketEvents.READY, this.expectedGuilds);
		}, 15000);
	}

	private setHelloTimeout(reset = false) {
		if (reset) {
			if (this.helloTimeout) {
				this.client.clearTimeout(this.helloTimeout);
				this.helloTimeout = undefined;
			}
			return;
		}

		this.helloTimeout = this.client.setTimeout(() => {
			this.destroy({ reset: true, closeCode: 4009 });
		}, 20000);
	}

	private setHeartbeatTimer(time: number) {
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

	private ackHeartbeat(): void {
		this.lastHeartbeatAcked = true;
		this.ping = Date.now() - this.lastPingTimestamp;
	}

	private identify(): void {
		return this.sessionId ? this.identifyResume() : this.identifyNew();
	}

	private identifyNew(): void {
		if (!this.client.token) {
			return;
		}

		this.status = Status.IDENTIFYING;

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
		if (!this.sessionId) {
			this.identifyNew();
			return;
		}

		this.status = Status.RESUMING;

		this.send({
			op: GatewayOPCodes.Resume,
			d: {
				token: this.client.token!,
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

			this.connection.send(pack(item), (error) => error && this.client.emit(Events.GATEWAY_ERROR, error));
			this.rateLimit.remaining--;
		}
	}

	public destroy({ closeCode = 1000, reset = false, emit = true } = {}): void {
		this.chunks = undefined;
		if (this.inflate) {
			this.inflate.close();
			this.inflate = undefined;
		}

		this.setHeartbeatTimer(-1);
		this.setHelloTimeout(true);

		if (this.connection) {
			if (this.connection.readyState === WebSocket.OPEN) {
				this.connection.close(closeCode);
			} else {
				this.cleanupConnection();
				try {
					this.connection.close(closeCode);
					// eslint-disable-next-line no-empty
				} catch {}
			}
		}

		if (emit && this.connection?.readyState !== WebSocket.OPEN) {
			this.emit(WebSocketEvents.DESTROYED);
		}

		this.connection = undefined;
		this.status = Status.DISCONNECTED;

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
