/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent as HttpsAgent } from 'https';
import { Readable } from 'stream';
import Collection from '@discordjs/collection';
import { APIVersion, RouteBases } from 'discord-api-types/v8';
import FormData from 'form-data';
import got, { Got, Headers, OptionsOfUnknownResponseBody } from 'got/dist/source';
import { Agent as Http2Agent } from 'http2-wrapper';
import { UserAgent, Exception, BaseClient, StaticRoute, DynamicRoute, RouteType, RequestHandler } from '..';
import { getTimestamp } from '../utils/snowflake';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestPayload {
	/**
	 * Attachments to send.
	 */
	attachments?: Record<string, string | Buffer | Readable>;
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
	 * @default true
	 */
	http2: boolean;
}

type Payload<T extends RouteType[keyof RouteType]> = {
	[K in keyof T as K extends 'p' ? 'json' : K extends 'q' ? 'query' : never]: T[K];
};

export class HttpManager {
	private readonly handlers = new Collection<string, RequestHandler>();
	public readonly hashes = new Collection<string, string>();
	public readonly dot: Got;
	public delay: Promise<void> | undefined = undefined;
	public reset = -1;

	public constructor(public readonly client: BaseClient, public readonly options: HttpOptions) {
		if (this.options.sweepInterval > 0) {
			setInterval(
				() => this.handlers.sweep((handler) => handler.inactive && !void this.hashes.delete(handler.id)),
				this.options.sweepInterval,
			);
		}

		this.dot = got.extend({
			prefixUrl: `${RouteBases.api}/v${APIVersion}`,
			timeout: this.options.requestTimeout,
			http2: this.options.http2,
			agent: this.options.http2 ? { http2: new Http2Agent() } : { https: new HttpsAgent({ keepAlive: true }) },
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

	public request<
		M extends T extends StaticRoute<infer R> | DynamicRoute<infer R> ? keyof R : never,
		T extends StaticRoute | DynamicRoute,
		R = T extends StaticRoute<infer D> | DynamicRoute<infer D> ? D[M] : never,
	>(
		method: M,
		route: T,
		...args: keyof Payload<R> extends never
			? [payload?: undefined, options?: RequestOptions]
			: [payload: Payload<R>, options?: RequestOptions]
	): Promise<'r' extends keyof R ? R['r'] : void>;
	public request<
		M extends T extends StaticRoute<infer R> | DynamicRoute<infer R> ? keyof R : never,
		T extends StaticRoute | DynamicRoute,
	>(
		method: M,
		route: T,
		payload?: RequestPayload,
		options?: RequestOptions,
	): T extends StaticRoute<infer R> | DynamicRoute<infer R>
		? Promise<'r' extends keyof R[M] ? R[M]['r'] : void>
		: never {
		const dotOptions: OptionsOfUnknownResponseBody = {
			searchParams: payload?.query,
			headers: {
				Authorization: options?.auth ?? true ? this.auth : undefined,
				'X-Audit-Log-Reason': options?.reason && encodeURIComponent(options.reason),
				...(options?.headers ?? {}),
			},
			method,
		};

		const attachments = payload?.attachments;
		if (attachments?.length) {
			const fd = (dotOptions.body = new FormData());

			for (const filename in attachments) {
				fd.append(filename, attachments[filename], filename);
			}
			if (payload!.json) {
				fd.append('payload_json', JSON.stringify(payload!.json), { contentType: 'application/json' });
			}
		} else if (payload?.json !== undefined) {
			dotOptions.json = payload.json;
		}
		return this.queueRequest(route, dotOptions);
	}

	private queueRequest(route: string | DynamicRoute, dotOptions: OptionsOfUnknownResponseBody): any {
		let finalRoute: string;
		let majorParameter = 'global';

		if (typeof route === 'string') {
			dotOptions.url = finalRoute = route;
		} else {
			dotOptions.url = route.endpoint;
			finalRoute = route.bucketRoute.join('');
			majorParameter = route.majorParameter;

			if (
				dotOptions.method === 'delete' &&
				route.bucketRoute[2] === '/messages/' &&
				Date.now() - getTimestamp(route.messageId!) > 1_209_600_000
			) {
				finalRoute += '/:exc';
			}
		}

		const hash = this.hashes.get(`${dotOptions.method}:${finalRoute}`) ?? `${dotOptions.method}:${finalRoute}`;
		const handler =
			this.handlers.get(`${majorParameter}:${hash}`) ?? this.createHandler(hash, majorParameter, finalRoute);

		return handler.push(dotOptions);
	}

	private createHandler(hash: string, majorParameter: string, bucketRoute: string) {
		const handler = new RequestHandler(this, hash, bucketRoute, majorParameter);
		this.handlers.set(handler.id, handler);
		return handler;
	}
}
