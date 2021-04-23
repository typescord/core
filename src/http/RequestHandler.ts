import { HTTPError, RequestError, Response } from 'got';
import { Request } from './Request';
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

function parseResponse(response: Response<Buffer>): Record<PropertyKey, unknown> | Buffer {
	if (response.headers['content-type']?.startsWith('application/json')) {
		return JSON.parse(response.body.toString());
	}
	return response.body;
}

function getApiOffset(serverDate: string): number {
	return new Date(serverDate).getTime() - Date.now();
}

export class RequestHandler {
	private readonly queue = new Queue();
	private remaining = Infinity;
	private reset = -1;

	public constructor(private readonly manager: HttpManager) {}

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

	private async globalDelay(ms: number): Promise<void> {
		await this.wait(ms);
		this.manager.delay = undefined;
	}

	public async push(request: Request): Promise<Record<PropertyKey, unknown> | Buffer> {
		await this.queue.wait();
		try {
			// eslint-disable-next-line @typescript-eslint/return-await
			return await this.execute(request);
		} finally {
			this.queue.shift();
		}
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	private async execute(request: Request): Promise<Record<PropertyKey, unknown> | Buffer> {
		while (this.limited) {
			const timeOffset = this.manager.client.options.http.timeOffset;

			await (this.globalLimited
				? this.manager.delay ?? (this.manager.delay = this.globalDelay(this.manager.reset - Date.now() + timeOffset))
				: this.wait(this.reset - Date.now() + timeOffset));
		}

		try {
			const response = await request.make();

			const serverDate = response.headers.date!;
			const remaining = response.headers['x-ratelimit-remaining'] as string;
			this.remaining = remaining ? +remaining : 1;
			const reset = response.headers['x-ratelimit-reset'] as string;

			if (reset) {
				this.reset = +reset * 1000 - getApiOffset(serverDate);
				// https://github.com/discordapp/discord-api-docs/issues/182
				if (request.options.route.includes('reactions')) {
					this.reset += 250;
				}
			}

			if (response.statusCode === 429) {
				const retryAfter = +response.headers['retry-after']! * 1000 - getApiOffset(serverDate);

				if (response.headers['x-ratelimit-global']) {
					this.manager.reset = Date.now() + retryAfter;
				} else if (!this.localLimited) {
					await this.wait(retryAfter);
				}

				return this.execute(request);
			}

			return parseResponse(response);
		} catch (error) {
			if (
				request.retries < this.manager.client.options.http.retryLimit &&
				((error instanceof HTTPError && RETRIES_STATUS_CODE.has(error.response.statusCode)) ||
					(error instanceof RequestError && error.code && RETRIES_ERROR_CODE.has(error.code)))
			) {
				request.retries++;
				return this.execute(request);
			}

			throw error;
		}
	}
}
