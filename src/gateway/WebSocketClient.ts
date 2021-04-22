import { EventEmitter } from 'events';
import ws, { CloseEvent, ErrorEvent } from 'ws';
import * as dgateway from 'discord-api-types/gateway/v8';
import { Client } from '../clients/Client';
import { GatewayURLQuery, WebSocket } from './WebSocket';
import { pack, unpack } from '.';
import { Status, WebSocketManager } from './WebSocketManager';
import { constants, createInflate, Inflate } from 'zlib';

export const enum WEBSOCKET_EVENTS {
	CLOSE = 'close',
	DESTROYED = 'destroyed',
	INVALID_SESSION = 'invalidSession',
	READY = 'ready',
	RESUMED = 'resumed',
}

const ZLIB_SUFFIX = Buffer.from([0x00, 0x00, 0xff, 0xff]);

interface RateLimit {
	queue: any[];
	total: number;
	remaining: number;
	time: number;
	timer?: NodeJS.Timeout;
}

export class WebSocketClient extends EventEmitter {
	public client: Client;
	public status = Status.IDLE;
	public eventsAttached = false;
	public ping = -1;
	private lastPingTimestamp = -1;
	private connection?: WebSocket;
	private results: Buffer[] = [];
	private chunks: Buffer[] = [];
	private inflator?: Inflate;
	private sequence = -1;
	public sessionID?: string;
	private expectedGuilds?: Set<string>;
	private connectedAt?: number;
	private lastHeartbeatAcked = true;
	private closeSequence = 0;
	private readyTimeout?: NodeJS.Timeout;
	private ratelimit: RateLimit = {
		queue: [],
		total: 120,
		remaining: 120,
		time: 60e3,
	};
	private helloTimeout?: NodeJS.Timeout;
	private heartbeatInterval?: NodeJS.Timeout;

	public constructor(public readonly manager: WebSocketManager) {
		super();

		this.client = manager.client;
	}

	public async connect(): Promise<void> {
		if (this.connection?.readyState === ws.OPEN && this.status === Status.READY) {
			return;
		}

		return new Promise((resolve, reject) => {
			this.once(WEBSOCKET_EVENTS.READY, () => resolve());
			this.once(WEBSOCKET_EVENTS.RESUMED, () => resolve());
			this.once(WEBSOCKET_EVENTS.CLOSE, (event: ws.CloseEvent) => reject(event));
			this.once(WEBSOCKET_EVENTS.INVALID_SESSION, () => reject());
			this.once(WEBSOCKET_EVENTS.DESTROYED, () => reject());

			if (this.connection?.readyState === ws.OPEN) {
				this.identify();

				return;
			}

			if (this.connection) {
				this.destroy();
			}

			const gatewayConnectQuery: GatewayURLQuery = { v: this.client.options.ws.protocolVersion };

			if (this.client.options.ws.zlib) {
				this.inflator = createInflate({ flush: constants.Z_SYNC_FLUSH, chunkSize: 65535 }).on(
					'data',
					this.results.push,
				);

				gatewayConnectQuery.compress = 'zlib-stream';
			}

			this.status = this.status === Status.DISCONNECTED ? Status.RECONNECTING : Status.CONNECTING;

			this.connection = new WebSocket(this.manager.gateway, gatewayConnectQuery);
			this.connection.addEventListener('open', this.onOpen.bind(this));
			this.connection.addEventListener('message', this.onMessage.bind(this));
			this.connection.addEventListener('error', this.onError.bind(this));
			this.connection.addEventListener('close', this.onClose.bind(this));

			console.log(this.connection)
		});
	}

	private onOpen(): void {
		this.status = Status.NEARLY;
	}

	private async onMessage({ data }: { data: string | Buffer }) {
		let packet = Buffer.from(data);

		if (this.client.options.ws.zlib) {
			this.chunks.push(packet);

			if (!packet.slice(-4).equals(ZLIB_SUFFIX)) {
				return;
			}

			this.inflator?.write(Buffer.concat(this.chunks));

			packet = await new Promise((resolve) => this.inflator?.flush(() => resolve(Buffer.concat(this.results))));

			this.results = [];
			this.chunks = [];
		}

		try {
			this.onPacket(unpack(packet));
		} catch {}
	}

	onError(event: ErrorEvent) {
		const error = event.error ? event.error : event;

		if (!error) {
			return;
		}

		// this.client.emit(Events.SHARD_ERROR, error, this.id);
	}

	private onClose(event: CloseEvent) {
		if (this.sequence !== -1) {
			this.closeSequence = this.sequence;
		}

		this.sequence = -1;

		this.setHeartbeatTimer(-1);
		this.setHelloTimeout(-1);

		if (this.connection) {
			this._cleanupConnection();
		}

		this.status = Status.DISCONNECTED;

		// this.emit(ShardEvents.CLOSE, event);
	}

	private onPacket(
		packet: dgateway.GatewaySendPayload | dgateway.GatewayReceivePayload | dgateway.GatewayDispatchPayload,
	): void {
		if (!packet) {
			return;
		}

		if ('t' in packet) {
			switch (packet.t) {
				case dgateway.GatewayDispatchEvents.Ready:
					// this.emit(ShardEvents.RESUMED);

					this.sessionID = packet.d.session_id;
					this.expectedGuilds = new Set(packet.d.guilds.map((guild) => guild.id));
					this.status = Status.WAITING_FOR_GUILDS;
					this.lastHeartbeatAcked = true;

					this.sendHeartbeat();

					break;
				case dgateway.GatewayDispatchEvents.Resumed: {
					// this.emit(ShardEvents.RESUMED);

					this.status = Status.READY;
					this.lastHeartbeatAcked = true;

					this.sendHeartbeat();

					break;
				}
			}
		}

		if ('s' in packet && packet.s > this.sequence) {
			this.sequence = packet.s;
		}

		switch (packet.op) {
			case dgateway.GatewayOPCodes.Hello:
				this.setHelloTimeout(-1);
				this.setHeartbeatTimer(packet.d.heartbeat_interval);
				this.identify();

				break;
			case dgateway.GatewayOPCodes.Reconnect:
				this.destroy({ closeCode: 4000 });

				break;
			case dgateway.GatewayOPCodes.InvalidSession:
				if (packet.d) {
					this.identifyResume();

					return;
				}

				this.sequence = -1;
				this.sessionID = undefined;
				this.status = Status.RECONNECTING;

				// this.emit(ShardEvents.INVALID_SESSION);
				break;
			case dgateway.GatewayOPCodes.HeartbeatAck:
				this.ackHeartbeat();

				break;
			case dgateway.GatewayOPCodes.Heartbeat:
				this.sendHeartbeat();

				break;
			default:
				this.manager.handlePacket(packet);

				if (
					this.status === Status.WAITING_FOR_GUILDS &&
					't' in packet &&
					packet.t === dgateway.GatewayDispatchEvents.GuildCreate
				) {
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

			// this.emit(ShardEvents.ALL_READY);

			return;
		}

		this.readyTimeout = this.client.setTimeout(() => {
			this.readyTimeout = undefined;
			this.status = Status.READY;

			// this.emit(ShardEvents.ALL_READY, this.expectedGuilds);
		}, 15000);
	}

	private setHelloTimeout(time: number) {
		if (time === -1) {
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

		this.send({ op: dgateway.GatewayOPCodes.Heartbeat, d: this.sequence }, true);
	}

	private ackHeartbeat(): void {
		this.lastHeartbeatAcked = true;
		this.ping = Date.now() - this.lastPingTimestamp;
	}

	private identify(): void {
		return this.sessionID ? this.identifyResume() : this.identifyNew();
	}

	private identifyNew(): void {
		if (!this.client.token) {
			return;
		}

		this.status = Status.IDENTIFYING;

		this.send(
			{
				op: dgateway.GatewayOPCodes.Identify,
				d: {
					...this.client.options.ws,
					token: this.client.token,
				},
			},
			true,
		);
	}

	private identifyResume(): void {
		if (!this.sessionID) {
			this.identifyNew();

			return;
		}

		this.status = Status.RESUMING;

		this.send(
			{
				op: dgateway.GatewayOPCodes.Resume,
				d: {
					token: this.client.token,
					session_id: this.sessionID,
					seq: this.closeSequence,
				},
			},
			true,
		);
	}

	public send(data: any, important = false): void {
		if (important) {
			this.ratelimit.queue.push(data);
		} else {
			this.ratelimit.queue.unshift(data);
		}

		this.processQueue();
	}

	private _send(data: any) {
		if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
			this.destroy({ closeCode: 4000 });

			return;
		}

		this.connection.send(pack(data), () => {
			/*if (err) {
				this.client.emit(Events.SHARD_ERROR, err, this.id);
			}*/
		});
	}

	private processQueue(): void {
		if (this.ratelimit.remaining === 0 || this.ratelimit.queue.length === 0) {
			return;
		}

		if (this.ratelimit.remaining === this.ratelimit.total) {
			this.ratelimit.timer = this.client.setTimeout(() => {
				this.ratelimit.remaining = this.ratelimit.total;

				this.processQueue();
			}, this.ratelimit.time);
		}

		while (this.ratelimit.remaining > 0) {
			const item = this.ratelimit.queue.shift();

			if (!item) {
				return;
			}

			this._send(item);

			this.ratelimit.remaining--;
		}
	}

	public destroy({ closeCode = 1000, reset = false, emit = true } = {}): void {
		this.setHeartbeatTimer(-1);
		this.setHelloTimeout(-1);

		if (this.connection) {
			if (this.connection.readyState === WebSocket.OPEN) {
				this.connection.close(closeCode);
			} else {
				this._cleanupConnection();

				try {
					this.connection.close(closeCode);
				} catch {}

				if (emit) {
					this._emitDestroyed();
				}
			}
		} else if (emit) {
			this._emitDestroyed();
		}

		this.connection = undefined;
		this.status = Status.DISCONNECTED;

		if (this.sequence !== -1) {
			this.closeSequence = this.sequence;
		}

		if (reset) {
			this.sequence = -1;
			this.sessionID = undefined;
		}

		this.ratelimit.remaining = this.ratelimit.total;
		this.ratelimit.queue.length = 0;

		if (this.ratelimit.timer) {
			this.client.clearTimeout(this.ratelimit.timer);

			this.ratelimit.timer = undefined;
		}
	}

	private _cleanupConnection(): void {
		if (!this.connection) {
			return;
		}

		this.connection.onopen = this.connection.onclose = this.connection.onerror = this.connection.onmessage = () => {};
	}

	private _emitDestroyed(): void {
		// this.emit(ShardEvents.DESTROYED);
	}
}
