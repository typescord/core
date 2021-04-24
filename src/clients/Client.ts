import EventEmitter from 'events';
import { Snowflake } from 'discord-api-types';
import merge from 'lodash.merge';
import { CloseEvent } from 'ws';
import { WebSocketManager } from '../gateway/WebSocketManager';
import { DeepRequired } from '../utils/types';
import { Events } from '../gateway/Events';
import { BaseClient, BaseClientOptions } from './BaseClient';

interface ClientEvents extends Record<Events, readonly unknown[]> {
	ready: [];
	gatewayDisconnection: [CloseEvent];
	gatewayError: [Error];
	gatewayReady: [Set<Snowflake>];
	gatewayReconnection: [];
}

export interface Client extends EventEmitter {
	on<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	on(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	addListener<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	addListener(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	prependListener<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	prependListener(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	once<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	once(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	prependOnceListener<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	prependOnceListener(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	emit<K extends keyof ClientEvents>(eventName: K, ...args: ClientEvents[K]): boolean;
	emit(eventName: string | symbol, ...args: unknown[]): boolean;

	off<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	off(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	removeListener<K extends keyof ClientEvents>(eventName: K, listener: (...args: ClientEvents[K]) => void): this;
	removeListener(eventName: string | symbol, listener: (...args: unknown[]) => void): this;

	removeAllListeners<K extends keyof ClientEvents>(eventName?: K): this;
	removeAllListeners(eventName?: string | symbol): this;

	listeners<K extends keyof ClientEvents>(eventName: K): ((...args: ClientEvents[K]) => void)[];
	listeners(eventName: string | symbol): ((...args: unknown[]) => void)[];

	listenerCount<K extends keyof ClientEvents>(eventName: K): number;
	listenerCount(eventName: string | symbol): number;
}

interface ClientOptions extends BaseClientOptions {
	ws?: {
		/**
		 * URL of Discord's WebSocket gateway.
		 * @default 'wss://gateway.discord.gg/'
		 */
		gateway?: string;
		/**
		 * Discord's gateway version.
		 * @default 8
		 */
		version?: 7 | 8;
		/**
		 * Use of zlib compression/decompression.
		 * @default false
		 */
		zlib?: boolean;
		/**
		 * Value between 50 and 250, total number of members where the gateway
		 * will stop sending offline members in the guild member list.
		 * @default 50
		 */
		largeThreshold?: number;
		/**
		 * Rate limits values. We recommend We recommend that you do not change
		 * these settings as you risk getting a rate limit if you do not respect
		 * these limits: https://discord.com/developers/docs/topics/gateway#rate-limiting.
		 */
		rateLimits?: {
			/**
			 * Max commands that can be made in `time`.
			 * @default 120
			 */
			limit?: number;
			/**
			 * Time in milliseconds
			 * @default 6_000
			 */
			time?: number;
		};
	};
} // temporary

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
		largeThreshold: 50,
		rateLimits: {
			limit: 120,
			time: 6_000,
		},
	},
};

// eslint-disable-next-line no-redeclare
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
