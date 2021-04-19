import { Agent as HttpsAgent } from 'https';
import { Agent as Http2Agent } from 'http2-wrapper';
import got, { Headers, HTTPError, OptionsOfBufferResponseBody, Response } from 'got';
import { FormData } from '@typescord/form-data';
import { USER_AGENT } from '../constants';
import { RestManager, Methods } from '.';

const dot = got.extend({
	agent: {
		https: new HttpsAgent({ keepAlive: true }),
		http2: new Http2Agent(),
	},
	headers: {
		'user-agent': USER_AGENT,
	},
	followRedirect: false,
	// retries are handled by the RequestHandler
	retry: 0,
});

export interface BaseRequestOptions {
	/**
	 * The reason of the request
	 */
	reason?: string;
}

export interface RequestOptions extends BaseRequestOptions {
	route: string;
	files?: any;
	query?: Record<PropertyKey, unknown>;
	json?: Record<PropertyKey, unknown>;
}

export class Request {
	public retries = 0;

	public constructor(
		public readonly manager: RestManager,
		public readonly method: Methods,
		public readonly url: string,
		public readonly options: RequestOptions,
	) {}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async make(): Promise<Response<Buffer>> {
		const options: OptionsOfBufferResponseBody & { headers: Headers } = {
			prefixUrl: this.manager.client.options.http.api,
			responseType: 'buffer',
			headers: {
				Authorization: this.manager.auth,
			},
			method: this.method,
			timeout: this.manager.client.options.http.requestTimeout,
			http2: this.manager.client.options.http.http2,
		};

		if (this.options.reason) {
			options.headers['X-Audit-Log-Reason'] = encodeURIComponent(this.options.reason);
		}

		if (this.options.files?.length) {
			const fd = new FormData();

			for (const { file, name } of this.options.files) {
				if (file) {
					fd.append(name, file, name);
				}
			}

			if (this.options.json) {
				fd.append('payload_json', JSON.stringify(this.options.json));
			}

			options.headers['Content-Type'] = fd.headers['Content-Type'];
			options.body = fd.stream;
			// eslint-disable-next-line eqeqeq
		} else if (this.options.json != undefined) {
			options.json = this.options.json;
		}

		return dot(this.url, options).catch((error) => {
			if (error instanceof HTTPError && error.response.statusCode === 429) {
				return error.response;
			}
			throw error;
		}) as Promise<Response<Buffer>>;
	}
}
