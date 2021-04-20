import merge from 'lodash.merge';
import { WebSocketManager } from '../gateway/WebSocketManager';
import { DeepRequired } from '../utils/types';
import { BaseClient, BaseClientOptions } from './BaseClient';

type ClientOptions = BaseClientOptions & {
	ws?: {
		/**
		 * URL of Discord's WebSocket gateway
		 * @default 'wss://gateway.discord.gg/'
		 */
		gateway?: string;
		/**
		 * Discord's gateway version
		 * @default 8
		 */
		version?: 7 | 8;
		/**
		 * Use of zlib compression/decompression
		 * @default false
		 */
		zlib?: boolean;
	};
}; // temporary

const defaultOptions: DeepRequired<ClientOptions> = {
	http: {
		requestTimeout: 10000,
		sweepInterval: 60000,
		retryLimit: 2,
		timeOffset: 0,
		http2: true,
		api: 'https://discord.com/api/v8',
	},
	ws: {
		gateway: 'wss://gateway.discord.gg/', // temporary
		version: 7,
		zlib: false,
	},
};

export class Client extends BaseClient {
	public readonly options!: DeepRequired<ClientOptions>;
	public webSocket = new WebSocketManager(this);

	public constructor(options?: ClientOptions) {
		super('Bot', options ? merge(defaultOptions, options) : defaultOptions);
	}

	public async login(token: string): Promise<void> {
		super.token = token;

		try {
			await this.webSocket.connect();
		} catch (error) {
			this.destroy();

			throw error;
		}
	}

	public destroy(): void {
		super.destroy();
		this.webSocket.destroy();
	}
}
