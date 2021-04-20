import { EventEmitter } from 'events';
import { Inflate } from 'zlib-sync';
import ws from 'ws';
import * as dgateway from 'discord-api-types/gateway/v8';
import { Client } from '../clients/Client';
import { WSEvents } from '../constants';
import { WebSocket, GatewayConnectQuery } from './WebSocket';
import { encoding, unpack } from '.';

enum Status {
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

// eslint-disable-next-line unicorn/no-useless-undefined
const zlibSync = await import('zlib-sync').catch(() => undefined);

export class WebSocketClient extends EventEmitter {
	public status = Status.IDLE;
	private connection?: WebSocket;
	private inflate?: Inflate;

	public constructor(public readonly client: Client) {
		super();
	}

	public async connect(): Promise<void> {
		if (this.connection?.readyState === ws.OPEN && this.status === Status.READY) {
			return;
		}

		return new Promise((resolve, reject) => {
			this.once(WSEvents.READY, () => resolve());
			this.once(WSEvents.RESUMED, () => resolve());
			this.once(WSEvents.CLOSE, (event: ws.CloseEvent) => reject(event));
			this.once(WSEvents.INVALID_SESSION, () => reject());
			this.once(WSEvents.DESTROYED, () => reject());

			if (this.connection?.readyState === ws.OPEN) {
				// this.identify();

				return;
			}

			if (this.connection) {
				// this.destroy();
			}

			const gatewayConnectQuery: GatewayConnectQuery = { v: this.client.options.ws.protocolVersion };

			if (zlibSync) {
				this.inflate = new zlibSync.Inflate({
					chunkSize: 65535,
					to: encoding === 'json' ? 'string' : undefined,
				});

				gatewayConnectQuery.compress = 'zlib-stream';
			}

			this.status = this.status === Status.DISCONNECTED ? Status.RECONNECTING : Status.CONNECTING;

			this.connection = new WebSocket(this.client.gateway, gatewayConnectQuery);
			this.connection.addEventListener('open', this.onOpen.bind(this));
			this.connection.addEventListener('message', this.onMessage.bind(this));
			this.connection.addEventListener('error', this.onError.bind(this));
			this.connection.addEventListener('close', this.onClose.bind(this));
		});
	}

	private onOpen(): void {
		this.status = Status.NEARLY;
	}

	private onMessage({ data }: ws.MessageEvent) {
		const raw = this.dataToRaw(data);

		if (!raw) {
			return;
		}

		let packet;

		try {
			packet = unpack(raw);

			// this.client.emit(Events.RAW, packet, this.id);
			if (packet.op === dgateway.GatewayOPCodes.Dispatch) {
				// this.manager.emit(packet.t, packet.d, this.id);
			}
		} catch {
			return;
		}

		// this.onPacket(packet);
	}

	private dataToRaw(data: ws.Data): ws.Data | undefined | null {
		let transformedData;

		if (data instanceof ArrayBuffer) {
			transformedData = new Uint8Array(data);
		} else if (Array.isArray(data)) {
			transformedData = Buffer.concat(data);
		} else {
			transformedData = data;
		}

		if (!zlibSync) {
			return transformedData;
		}

		const isFlush = [...transformedData.slice(-4)].every((byte, index) => byte === [0, 0, 255, 255][index]);

		if (typeof transformedData === 'string') {
			this.inflate?.push(Buffer.from(transformedData), isFlush && zlibSync.Z_SYNC_FLUSH);
		} else if (transformedData instanceof Uint8Array) {
			this.inflate?.push(Buffer.from(transformedData.buffer), isFlush && zlibSync.Z_SYNC_FLUSH);
		} else {
			this.inflate?.push(transformedData, isFlush && zlibSync.Z_SYNC_FLUSH);
		}

		return isFlush ? this.inflate?.result : undefined;
	}

	private onError(): void {
		return;
	}

	private onClose(): void {
		return;
	}
}
