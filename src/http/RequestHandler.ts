import { HTTPError, OptionsOfUnknownResponseBody, RequestError, Response, TimeoutError } from 'got';
import { Queue } from './Queue';
import { HttpManager } from './HttpManager';

const RETRIES_STATUS_CODE = new Set([408, 500, 502, 503, 504, 521, 522, 524]);
const RETRIES_ERROR_CODE = new Set([
	'ETIMEDOUT',
	'ECONNRESET',
	'EADDRINUSE',
	'ECONNREFUSED',
	'EPIPE',
	'ENOTFOUND',
	'ENETUNREACH',
	'EAI_AGAIN',
]);

function parseResponse(response: Response<unknown>): Record<PropertyKey, unknown> | Buffer {
	if (response.headers['content-type']?.startsWith('application/json')) {
		return JSON.parse(response.rawBody.toString());
	}
	return response.rawBody;
}

export class RequestHandler {
	private readonly queue = new Queue();
	private remaining = 1;
	private reset = -1;

	public constructor(
		private readonly manager: HttpManager,
		private readonly hash: string,
		private readonly bucketRoute: string,
	) {}

	public get localLimited(): boolean {
		return this.remaining <= 0 && Date.now() < this.reset;
	}

	public get globalLimited(): boolean {
		return Date.now() < this.manager.reset;
	}

	public get limited(): boolean {
		return this.globalLimited || this.localLimited;
	}

	public get inactive(): boolean {
		return this.queue.length === 0 && !this.limited;
	}

	private wait(ms: number): Promise<void> {
		return new Promise((resolve) => this.manager.client.setTimeout(resolve, ms));
	}

	public async push(dotOptions: OptionsOfUnknownResponseBody): Promise<Record<PropertyKey, unknown> | Buffer> {
		await this.queue.wait();
		try {
			if (this.manager.delay) {
				await this.manager.delay;
			}
			if (this.limited) {
				await this.wait(this.reset - Date.now());
			}
			// eslint-disable-next-line @typescript-eslint/return-await
			return await this.execute(dotOptions);
		} finally {
			this.queue.shift();
		}
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	private async execute(
		dotOptions: OptionsOfUnknownResponseBody,
		retries = 0,
	): Promise<Record<PropertyKey, unknown> | Buffer> {
		const offset = this.manager.options.timeOffset;

		try {
			const response = await this.manager.dot(dotOptions);

			const remaining = response.headers['x-ratelimit-remaining'];
			this.remaining = remaining ? +remaining : 1;

			const reset = response.headers['x-ratelimit-reset-after'];
			this.reset = reset ? +reset * 1000 + response.timings.response! + offset : response.timings.response!;

			const hash = response.headers['x-rateLimit-bucket'] as string;
			if (hash && hash !== this.hash) {
				this.manager.hashes.set(`${dotOptions.method}:${this.bucketRoute}`, hash);
			}

			const retry = response.headers['retry-after'];
			const retryAfter = retry ? +retry * 1000 : 0;

			if (response.headers['x-ratelimit-global']) {
				this.manager.delay = this.wait(retryAfter + offset).then(() => (this.manager.delay = undefined));
			}

			if (response.statusCode === 429) {
				await this.wait(retryAfter);
				return this.execute(dotOptions);
			}

			return parseResponse(response);
		} catch (error) {
			if (
				retries < this.manager.options.retryLimit &&
				(error instanceof TimeoutError ||
					(error instanceof HTTPError && RETRIES_STATUS_CODE.has(error.response.statusCode)) ||
					(error instanceof RequestError && error.code && RETRIES_ERROR_CODE.has(error.code)))
			) {
				return this.execute(dotOptions, retries + 1);
			}

			throw error;
		}
	}
}
