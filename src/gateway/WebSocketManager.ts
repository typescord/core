import EventEmitter from 'events';
import { setTimeout as wait } from 'timers/promises';
import { GatewayDispatchEvents, GatewayReceivePayload } from 'discord-api-types/gateway/v8';
import { Snowflake, Client, Exception, GatewayException, Events, WebSocketClient, WebSocketEvents } from '..';
import { gatewayBot } from '../http/routes';

export const enum WebSocketStatus {
	Ready,
	Connecting,
	Reconnecting,
	Idle,
	Nearly,
	Disconnected,
	WaitingForGuilds,
	Identifying,
	Resuming,
}

const BeforeReadyWhitelist = new Set([
	GatewayDispatchEvents.Ready,
	GatewayDispatchEvents.Resumed,
	GatewayDispatchEvents.GuildCreate,
	GatewayDispatchEvents.GuildDelete,
	GatewayDispatchEvents.GuildMembersChunk,
	GatewayDispatchEvents.GuildMemberAdd,
	GatewayDispatchEvents.GuildMemberRemove,
]);

const WEBSOCKET_CODES = {
	1000: 'WS_CLOSE_REQUESTED',
	4004: 'TOKEN_INVALID',
	4013: 'INVALID_INTENTS',
	4014: 'DISALLOWED_INTENTS',
} as const;

const UNRECOVERABLE_CLOSE_CODES = new Set([4004, 4013, 4014]);
const UNRESUMABLE_CLOSE_CODES = new Set([1000, 4006, 4007]);

export class WebSocketManager extends EventEmitter {
	private webSocketClient?: WebSocketClient;
	private packetQueue: GatewayReceivePayload[] = [];
	private status = WebSocketStatus.Idle;
	private reconnecting = false;
	public destroyed = false;
	public gatewayUrl?: string;

	public constructor(public readonly client: Client) {
		super();
	}

	public get ping(): number | undefined {
		return this.webSocketClient?.ping;
	}

	public async connect(): Promise<void> {
		const gateway = await this.client.$request(gatewayBot, 'get').catch((error) => {
			throw error.httpStatus === 401 ? new Exception('TOKEN_INVALID') : error;
		});

		this.gatewayUrl = gateway.url;

		this.webSocketClient = new WebSocketClient(this);
		return this.createClient();
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	private async createClient(): Promise<void> {
		if (!this.webSocketClient!.eventsAttached) {
			this.webSocketClient!.on(WebSocketEvents.Ready, (unavailableGuilds: Set<Snowflake>) => {
				this.client.emit(Events.GatewayReady, unavailableGuilds);
				this.reconnecting = false;

				if (this.status === WebSocketStatus.Ready) {
					return;
				}

				this.status = WebSocketStatus.Ready;
				this.client.emit(Events.ClientReady);

				this.handlePacket();
			});

			this.webSocketClient!.on(WebSocketEvents.Close, (error: GatewayException) => {
				if (error.closeCode === 1000 ? this.destroyed : UNRECOVERABLE_CLOSE_CODES.has(error.closeCode)) {
					this.client.emit(Events.GatewayError, error);
					return;
				}

				if (UNRESUMABLE_CLOSE_CODES.has(error.closeCode) && this.webSocketClient) {
					// These event codes cannot be resumed
					this.webSocketClient.sessionId = undefined;
				}

				this.client.emit(Events.GatewayReconnecting);

				if (!this.webSocketClient?.sessionId) {
					this.webSocketClient?.destroy({ reset: true, emit: false });
				}

				this.reconnect();
			});

			this.webSocketClient!.on(WebSocketEvents.InvalidSession, () => {
				this.client.emit(Events.GatewayReconnecting);
			});

			this.webSocketClient!.on(WebSocketEvents.Destroyed, () => {
				this.client.emit(Events.GatewayReconnecting);
				this.reconnect();
			});

			this.webSocketClient!.eventsAttached = true;
		}

		try {
			await this.webSocketClient!.connect();
		} catch (error) {
			if (error && UNRECOVERABLE_CLOSE_CODES.has(error.closeCode)) {
				throw new Exception(WEBSOCKET_CODES[error as keyof typeof WEBSOCKET_CODES]);
			} else if (!error || error.closeCode) {
				this.reconnect();
			} else {
				throw error;
			}
		}
	}

	private async reconnect(): Promise<void> {
		if (this.reconnecting || this.status !== WebSocketStatus.Ready) {
			return;
		}

		this.reconnecting = true;

		try {
			await this.createClient();
		} catch (error) {
			if (error.httpStatus !== 401) {
				await wait(5000);
				this.reconnecting = false;
				return this.reconnect();
			}

			this.client.destroy();
		} finally {
			this.reconnecting = false;
		}
	}

	public destroy(): void {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.webSocketClient?.destroy({ closeCode: 1000, reset: true, emit: false });
	}

	public handlePacket(packet?: GatewayReceivePayload): void {
		if (packet && this.status !== WebSocketStatus.Ready && 't' in packet && !BeforeReadyWhitelist.has(packet.t)) {
			this.packetQueue.push(packet);
			return;
		}

		if (this.packetQueue.length > 0) {
			const packetFromQueue = this.packetQueue.shift();
			setImmediate(() => this.handlePacket(packetFromQueue));
		}

		// TODO: handle the packet here
	}
}
