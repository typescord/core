import EventEmitter from 'events';
import { Snowflake } from 'discord-api-types';
import merge from 'lodash.merge';
import { Events, WebSocketManager } from '../gateway';
import { GatewayException } from '../exceptions';
import { BaseClient } from './BaseClient';
import type { HttpOptions } from '../http';
import type { DeepRequired } from '../utils';
import type { GatewayReceivePayload } from 'discord-api-types/gateway/v8';

interface ClientEvents extends Record<Events, readonly unknown[]> {
	raw: [GatewayReceivePayload];
	ready: [];
	gatewayDisconnection: [GatewayException];
	gatewayError: [Error];
	gatewayReady: [Set<Snowflake>];
	gatewayReconnecting: [];
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

interface ClientOptions {
	/**
	 * Http options
	 */
	http?: HttpOptions;
	/**
	 * WebSocket options
	 */
	ws?: {
		/**
		 * Discord's gateway version.
		 * @defaultValue 8
		 */
		version?: 7 | 8;
		/**
		 * If the Gateway should send zlib-compressed payloads.
		 * In this case, the client will inflate theses payloads.
		 * *The client will never send compressed payload.*
		 * @defaultValue false
		 */
		compress?: boolean;
		/**
		 * Value between 50 and 250, total number of members where the gateway
		 * will stop sending offline members in the guild member list.
		 * @defaultValue 50
		 */
		largeThreshold?: number;
		/**
		 * Enabled gateway intents for this connection.
		 * https://discord.com/developers/docs/topics/gateway#gateway-intents
		 * @defaultValue 513
		 */
		intents?: number;
		/**
		 * The hello timeout, in milliseconds.
		 * Destroys the Client if the Hello packet
		 * is not received before the specified timeout.
		 * If set to `Infinity`, the timeout will not be applied.
		 * @defaultValue 20_000
		 */
		helloTimeout?: number;
		/**
		 * Rate limits values. We recommend that you do not change
		 * these settings as you risk getting a rate limit if you do not respect
		 * these limits: https://discord.com/developers/docs/topics/gateway#rate-limiting.
		 */
		rateLimit?: {
			/**
			 * Max commands that can be made in `time`.
			 * @defaultValue 120
			 */
			limit?: number;
			/**
			 * Time in milliseconds
			 * @defaultValue 6_000
			 */
			time?: number;
		};
	};
}

const defaultOptions: DeepRequired<Omit<ClientOptions, 'http'>> = {
	ws: {
		version: 8,
		compress: false,
		largeThreshold: 50,
		intents: 513,
		helloTimeout: 20_000,
		rateLimit: {
			limit: 120,
			time: 6000,
		},
	},
};

// eslint-disable-next-line no-redeclare
export class Client extends BaseClient {
	public readonly options: DeepRequired<Omit<ClientOptions, 'http'>>;
	public webSocket = new WebSocketManager(this);

	public constructor({ http, ...options }: ClientOptions = defaultOptions) {
		super('Bot', http);
		this.options = merge(defaultOptions, options);
	}

	public $request = this.http.request.bind(this.http);

	public get ping(): number | undefined {
		return this.webSocket.ping;
	}

	public async login(token: string): Promise<void> {
		super.token = token;
		super.destroyed = false;
		this.webSocket.destroyed = false;

		try {
			await this.webSocket.connect();
		} catch (error) {
			this.destroy();
			throw error;
		}
	}

	public destroy(): void {
		this.webSocket.destroy();
		super.destroy();
	}
}
