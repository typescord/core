import EventEmitter from 'events';
import { promisify } from 'util';
import * as dgateway from 'discord-api-types/gateway/v8';
import { Client } from '../clients';
import { WebSocketClient, WebSocketEvents } from './WebSocketClient';

export enum Status {
	READY,
	CONNECTING,
	RECONNECTING,
	IDLE,
	NEARLY,
	DISCONNECTED,
	WAITING_FOR_GUILDS,
	IDENTIFYING,
	RESUMING,
}

const BeforeReadyWhitelist = new Set([
	dgateway.GatewayDispatchEvents.Ready,
	dgateway.GatewayDispatchEvents.Resumed,
	dgateway.GatewayDispatchEvents.GuildCreate,
	dgateway.GatewayDispatchEvents.GuildDelete,
	dgateway.GatewayDispatchEvents.GuildMembersChunk,
	dgateway.GatewayDispatchEvents.GuildMemberAdd,
	dgateway.GatewayDispatchEvents.GuildMemberRemove,
]);

/*const WEBSOCKET_CODES = {
	1000: 'WS_CLOSE_REQUESTED',
	4004: 'TOKEN_INVALID',
} as const;*/

const UNRECOVERABLE_CLOSE_CODES = new Set([4004]);
const UNRESUMABLE_CLOSE_CODES = new Set([1000]);

export class WebSocketManager extends EventEmitter {
	private webSocketClient?: WebSocketClient;
	private packetQueue: (
		| dgateway.GatewaySendPayload
		| dgateway.GatewayReceivePayload
		| dgateway.GatewayDispatchPayload
	)[] = [];
	private status = Status.IDLE;
	private destroyed = false;
	private reconnecting = false;
	public gateway = 'wss://gateway.discord.gg/';

	public constructor(public readonly client: Client) {
		super();
	}

	public get ping(): number | undefined {
		return this.webSocketClient?.ping;
	}

	public async connect(): Promise<void> {
		/*const invalidToken = new Exception(WEBSOCKET_CODES[GatewayCloseCodes.AuthenticationFailed]);
		const { url: gatewayURL } = await this.client.api.gateway.bot.get().catch((error) => {
			throw error.httpStatus === 401 ? invalidToken : error;
		});

		this.gateway = `${gatewayURL}/`;*/

		this.createClient();
	}

	private async createClient(): Promise<void> {
		this.webSocketClient = new WebSocketClient(this);

		if (!this.webSocketClient.eventsAttached) {
			this.webSocketClient.on(WebSocketEvents.READY, () => {
				// this.client.emit(Events.SHARD_READY, this.webSocketClient.id, unavailableGuilds);

				this.reconnecting = false;

				this.triggerClientReady();
			});

			this.webSocketClient.on(WebSocketEvents.CLOSE, (event) => {
				if (event.code === 1000 ? this.destroyed : UNRECOVERABLE_CLOSE_CODES.has(event.code)) {
					// this.client.emit(Events.SHARD_DISCONNECT, event, this.webSocketClient.id);

					return;
				}

				if (UNRESUMABLE_CLOSE_CODES.has(event.code) && this.webSocketClient) {
					// These event codes cannot be resumed
					this.webSocketClient.sessionId = undefined;
				}

				// this.client.emit(Events.SHARD_RECONNECTING, this.webSocketClient.id);

				if (!this.webSocketClient?.sessionId) {
					this.webSocketClient?.destroy({ reset: true, emit: false });
				}

				this.reconnect();
			});

			/*this.webSocketClient.on(WebSocketEvents.INVALID_SESSION, () => {
				this.client.emit(Events.SHARD_RECONNECTING, this.webSocketClient.id);
			});*/

			this.webSocketClient.on(WebSocketEvents.DESTROYED, () => {
				//this.client.emit(Events.SHARD_RECONNECTING, this.webSocketClient.id);

				this.reconnect();
			});

			this.webSocketClient.eventsAttached = true;
		}

		try {
			await this.webSocketClient.connect();
		} catch (error) {
			console.log(error);
		}
	}

	private async reconnect(): Promise<void> {
		if (this.reconnecting || this.status !== Status.READY) {
			return;
		}

		this.reconnecting = true;

		try {
			await this.createClient();
		} catch (error) {
			if (error.httpStatus !== 401) {
				await promisify(this.client.setTimeout)(5000);

				this.reconnecting = false;

				return this.reconnect();
			}

			this.destroy();
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

	public handlePacket(
		packet?: dgateway.GatewaySendPayload | dgateway.GatewayReceivePayload | dgateway.GatewayDispatchPayload,
	): boolean {
		if (this.packetQueue.length > 0) {
			const packetFromQueue = this.packetQueue.shift();

			this.client.setImmediate(() => {
				this.handlePacket(packetFromQueue);
			});
		}

		if (!packet) {
			return true;
		}

		if ('t' in packet && this.status !== Status.READY && !BeforeReadyWhitelist.has(packet.t)) {
			this.packetQueue.push(packet);

			return false;
		}

		// handle the packet here

		return true;
	}

	private triggerClientReady(): void {
		if (this.status === Status.READY) {
			return;
		}

		this.status = Status.READY;

		// this.client.emit(Events.CLIENT_READY);

		this.handlePacket();
	}
}