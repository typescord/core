/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent as HttpsAgent } from 'https';
import type { ReadStream } from 'fs';
import Collection from '@discordjs/collection';
import { FormData } from '@typescord/famfor';
import got, { Got, Headers, OptionsOfUnknownResponseBody } from 'got/dist/source';
import { Agent as Http2Agent } from 'http2-wrapper';
import { UserAgent } from '../constants';
import { Exception } from '../exceptions';
import type { BaseClient } from '../clients/BaseClient';
import { Snowflake } from '../utils';
import type { StaticRoute, DynamicRoute } from './routing';
import { RequestHandler } from './RequestHandler';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestPayload {
	/**
	 * Attachments to send.
	 */
	attachments?: Record<string, string | Buffer | ReadStream>;
	/**
	 * Query string parameters.
	 */
	query?: Record<string, any>;
	/**
	 * JSON body of the request.
	 */
	json?: any;
}

export interface RequestOptions {
	/**
	 * The reason of the request
	 */
	reason?: string;
	/**
	 * Additionnals headers for the request.
	 */
	headers?: Headers;
	/**
	 * If the Authorization header should be specified.
	 * @default true
	 */
	auth?: boolean;
}

type RoutePayload<E> = E extends StaticRoute<any, infer R> | DynamicRoute<any, infer R> ? R : void;
type RouteResult<E> = E extends StaticRoute<infer R> | DynamicRoute<infer R> ? R : undefined;

export interface HttpOptions {
	/**
	 * The timeout of http requests, in milliseconds.
	 * @default 10000
	 */
	requestTimeout: number;
	/**
	 * How frequently to delete inactive request buckets, in milliseconds (or Infinity for never).
	 * @default 60000
	 */
	sweepInterval: number;
	/**
	 * The number of times to retry a failed http request.
	 * @default 2
	 */
	retryLimit: number;
	/**
	 * Time in milliseconds to add for requets (rate limit handling).
	 * A higher value will reduce rate limit errors.
	 * @default 0
	 */
	timeOffset: number;
	/**
	 * If HTTP/2 should be used instead of HTTP/1.1.
	 * It will choose either HTTP/1.1 or HTTP/2 depending on the ALPN protocol.
	 * @default false
	 */
	http2: boolean;
	/**
	 * The Discord API url.
	 * @default 'https://discord.com/api/v8'
	 */
	api: string;
}

export class HttpManager {
	private readonly handlers = new Collection<string, RequestHandler>();
	public readonly hashes = new Collection<string, string>();
	public readonly dot: Got;
	public delay?: Promise<void>;
	public reset = -1;

	public constructor(public readonly client: BaseClient, public readonly options: HttpOptions) {
		if (this.options.sweepInterval > 0) {
			client.setInterval(
				() => this.handlers.sweep((handler) => handler.inactive && !void this.hashes.delete(handler.id)),
				this.options.sweepInterval,
			);
		}

		this.dot = got.extend({
			prefixUrl: this.options.api,
			timeout: this.options.requestTimeout,
			http2: this.options.http2,
			agent: {
				https: new HttpsAgent({ keepAlive: true }),
				http2: new Http2Agent(),
			},
			headers: {
				'user-agent': UserAgent,
			},
			followRedirect: false,
			retry: 0,
		});
	}

	public get auth(): string {
		if (!this.client.token) {
			throw new Exception('TOKEN_MISSING');
		}
		return `${this.client.tokenType} ${this.client.token}`;
	}

	public request<T extends StaticRoute<any, undefined> | DynamicRoute<any, undefined>>(
		method: Method,
		route: T,
		payload?: undefined,
		options?: RequestOptions,
	): Promise<RouteResult<T>>;
	public request<T extends StaticRoute<any, undefined> | DynamicRoute<any, undefined>>(
		method: Method,
		route: T,
		payload: RoutePayload<T>,
		options?: RequestOptions,
	): Promise<RouteResult<T>>;
	public request<T extends StaticRoute<any, undefined> | DynamicRoute<any, undefined>>(
		method: Method,
		route: T,
		payload?: RequestPayload,
		options?: RequestOptions,
	): Promise<RouteResult<T>> {
		const dotOptions: OptionsOfUnknownResponseBody = {
			searchParams: payload?.query,
			headers: {
				Authorization: options?.auth ?? true ? this.auth : undefined,
				'X-Audit-Log-Reason': options?.reason && encodeURIComponent(options.reason),
				...(options?.headers || {}),
			},
			method,
		};

		const attachments = payload?.attachments;
		if (attachments?.length) {
			const fd = new FormData();
			for (const filename in attachments) {
				fd.append(filename, attachments[filename] as any, { filename });
			}
			if (payload!.json) {
				fd.append('payload_json', JSON.stringify(payload!.json));
			}
			dotOptions.headers = { ...dotOptions.headers, ...fd.headers };
			dotOptions.body = fd.stream;
			// eslint-disable-next-line eqeqeq
		} else if (payload?.json != undefined) {
			dotOptions.json = payload.json;
		}

		return this.queueRequest(route, dotOptions);
	}

	private queueRequest(route: string | DynamicRoute, dotOptions: OptionsOfUnknownResponseBody): Promise<any> {
		let finalRoute: string;
		let majorParameter: DynamicRoute['majorParameter'] = 'global';

		if (typeof route === 'string') {
			dotOptions.url = finalRoute = route;
		} else {
			dotOptions.url = route.endpoint;
			finalRoute = route.bucketRoute.join('');
			majorParameter = route.majorParameter;

			if (dotOptions.method === 'delete' && route.bucketRoute[2] === '/messages/') {
				const id = Snowflake.deconstruct(route.bucketRoute[3])!;
				if (Date.now() - id.timestamp > 1000 * 60 * 60 * 24 * 14) {
					finalRoute += '/:old-message';
				}
			}
		}

		const hash = this.hashes.get(`${dotOptions.method}:${finalRoute}`) ?? `${dotOptions.method}-${finalRoute}`;
		const handler =
			this.handlers.get(`${majorParameter}:${hash}`) ?? this.createHandler(hash, majorParameter, finalRoute);

		return handler.push(dotOptions);
	}

	private createHandler(hash: string, majorParameter: DynamicRoute['majorParameter'], bucketRoute: string) {
		const handler = new RequestHandler(this, hash, bucketRoute, `${majorParameter}:${hash}` as const);
		this.handlers.set(handler.id, handler);
		return handler;
	}
}
