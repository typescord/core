/* eslint-disable @typescript-eslint/no-explicit-any, unicorn/no-array-for-each, unicorn/no-array-callback-reference */

import { EventEmitter } from 'events';
import merge from 'lodash.merge';
import { HttpManager, HttpOptions } from '../http';
import { DeepPartial } from '../utils';

export type TokenType = 'Bot' | 'Bearer';

const kImmediates = Symbol('kImmediates');
const kTimeouts = Symbol('kTimeouts');
const kIntervals = Symbol('kIntervals');

const defaultOptions: HttpOptions = {
	requestTimeout: 10_000,
	sweepInterval: 60_000,
	retryLimit: 2,
	timeOffset: 0,
	http2: false,
	api: 'https://discord.com/api/v8',
};

export class BaseClient extends EventEmitter {
	private readonly [kImmediates] = new Set<NodeJS.Immediate>();
	private readonly [kTimeouts] = new Set<NodeJS.Timeout>();
	private readonly [kIntervals] = new Set<NodeJS.Timeout>();

	public readonly http: HttpManager;
	public destroyed = false;
	public token?: string;

	protected constructor(public readonly tokenType: TokenType, httpOptions?: DeepPartial<HttpOptions>) {
		super();
		this.http = new HttpManager(this, httpOptions ? merge(defaultOptions, httpOptions) : defaultOptions);
	}

	public setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate {
		const immediateId = setImmediate(() => {
			this[kImmediates].delete(immediateId);
			callback(...args);
		});

		this[kImmediates].add(immediateId);
		return immediateId;
	}

	public clearImmediate(immediateId: NodeJS.Immediate): void {
		clearImmediate(immediateId);
		this[kImmediates].delete(immediateId);
	}

	public setTimeout(callback: (...args: any[]) => void, ms?: number, ...args: any[]): NodeJS.Timeout {
		const timeoutId = setTimeout(() => {
			this[kTimeouts].delete(timeoutId);
			callback(...args);
		}, ms);

		this[kTimeouts].add(timeoutId);
		return timeoutId;
	}

	public clearTimeout(timeoutId: NodeJS.Timeout): void {
		clearTimeout(timeoutId);
		this[kTimeouts].delete(timeoutId);
	}

	public setInterval(callback: (...args: any[]) => void, ms?: number, ...args: any[]): NodeJS.Timeout {
		const intervalId = setInterval(() => callback(...args), ms);

		this[kIntervals].add(intervalId);
		return intervalId;
	}

	public clearInterval(intervalId: NodeJS.Timeout): void {
		clearInterval(intervalId);
		this[kIntervals].delete(intervalId);
	}

	public destroy(): void {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.token = undefined;

		this[kIntervals].forEach(this.clearInterval, this);
		this[kTimeouts].forEach(this.clearTimeout, this);
		this[kImmediates].forEach(this.clearImmediate, this);
	}
}
