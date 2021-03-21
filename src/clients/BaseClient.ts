/* eslint-disable unicorn/no-array-for-each, unicorn/no-array-callback-reference */

import { EventEmitter } from 'events';
import merge from 'lodash.merge';
import { DeepRequired } from '../utils/types';
import { RestManager, Routes } from '../http';

export type TokenType = 'Bot' | 'Bearer';

const kImmediates = Symbol('kImmediates');
const kTimeouts = Symbol('kTimeouts');
const kIntervals = Symbol('kIntervals');

export interface BaseClientOptions {
	http: {
		/**
		 * The timeout of http requests, in milliseconds.
		 * @default 10000
		 */
		requestTimeout?: number;
		/**
		 * How frequently to delete inactive request buckets, in milliseconds (or Infinity for never).
		 * @default 60000
		 */
		sweepInterval?: number;
		/**
		 * The number of times to retry a failed http request.
		 * @default 2
		 */
		retryLimit?: number;
		/**
		 * Time in milliseconds to add for requets (rate limit handling).
		 * A higher value will reduce rate limit errors.
		 * @default 0
		 */
		timeOffset?: number;
		/**
		 * If HTTP/2 should be used instead of HTTP/1.1.
		 * It will choose either HTTP/1.1 or HTTP/2 depending on the ALPN protocol.
		 * @default false
		 */
		http2?: boolean;
		/**
		 * The Discord API url.
		 * @default 'https://discord.com/api/v8'
		 */
		api?: string;
	};
}

const defaultOptions: DeepRequired<BaseClientOptions> = {
	http: {
		requestTimeout: 10000,
		sweepInterval: 60000,
		retryLimit: 2,
		timeOffset: 0,
		http2: false,
		api: 'https://discord.com/api/v8',
	},
};

export class BaseClient extends EventEmitter {
	private readonly [kImmediates] = new Set<NodeJS.Immediate>();
	private readonly [kTimeouts] = new Set<NodeJS.Timeout>();
	private readonly [kIntervals] = new Set<NodeJS.Timeout>();

	public readonly options: DeepRequired<BaseClientOptions>;
	public readonly rest: RestManager;
	public destroyed = false;
	public token?: string;

	protected constructor(public readonly tokenType: TokenType, options?: BaseClientOptions) {
		super();
		this.options = options ? merge(defaultOptions, options) : defaultOptions;
		this.rest = new RestManager(this);
	}

	public get api(): Routes {
		return this.rest.api;
	}

	public setImmediate<T extends unknown[]>(callback: (...args: T) => void, ...args: T): NodeJS.Immediate {
		const immediateId = setImmediate(() => {
			this[kImmediates].delete(immediateId);
			callback(...args);
		});

		this[kImmediates].add(immediateId);
		return immediateId;
	}

	public clearImmediate(immediateId: NodeJS.Immediate): void {
		if (!this[kImmediates].delete(immediateId)) {
			return;
		}

		clearImmediate(immediateId);
	}

	public setTimeout<T extends unknown[]>(callback: (...args: T) => void, ms: number, ...args: T): NodeJS.Timeout {
		const timeoutId = setTimeout(() => {
			this[kTimeouts].delete(timeoutId);
			callback(...args);
		}, ms);

		this[kTimeouts].add(timeoutId);
		return timeoutId;
	}

	public clearTimeout(timeoutId: NodeJS.Timeout): void {
		if (!this[kTimeouts].delete(timeoutId)) {
			return;
		}

		clearTimeout(timeoutId);
	}

	public setInterval<T extends unknown[]>(callback: (...args: T) => void, ms: number, ...args: T): NodeJS.Timeout {
		const intervalId = setInterval(() => callback(...args), ms);

		this[kIntervals].add(intervalId);
		return intervalId;
	}

	public clearInterval(intervalId: NodeJS.Timeout): void {
		if (!this[kIntervals].delete(intervalId)) {
			return;
		}

		clearTimeout(intervalId);
	}

	public destroy(): void {
		if (this.destroyed) {
			return;
		}
		this.destroyed = true;

		this[kIntervals].forEach(this.clearInterval, this);
		this[kTimeouts].forEach(this.clearTimeout, this);
		this[kImmediates].forEach(this.clearImmediate, this);
	}
}
