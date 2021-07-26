/* eslint-disable @typescript-eslint/no-explicit-any, unicorn/no-array-for-each, unicorn/no-array-callback-reference */

import { EventEmitter } from 'events';
import merge from 'lodash.merge';
import { RouteBases } from 'discord-api-types/v8';
import { HttpManager, HttpOptions } from '../http';
import { DeepPartial } from '../utils/types';

export type TokenType = 'Bot' | 'Bearer';

const defaultOptions: HttpOptions = {
	requestTimeout: 10_000,
	sweepInterval: 60_000,
	retryLimit: 2,
	timeOffset: 0,
	http2: true,
	apiUrl: RouteBases.api,
	cdnUrl: RouteBases.cdn,
	inviteUrl: RouteBases.invite,
	templateUrl: RouteBases.template,
	giftUrl: RouteBases.gift,
};

export class BaseClient extends EventEmitter {
	public readonly http: HttpManager;
	public destroyed = false;
	public token?: string;

	protected constructor(public readonly tokenType: TokenType, httpOptions?: DeepPartial<HttpOptions>) {
		super();
		this.http = new HttpManager(this, httpOptions ? merge(defaultOptions, httpOptions) : defaultOptions);
	}

	public destroy(): void {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.token = undefined;
	}
}
