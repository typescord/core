import Collection from '@discordjs/collection';
import { BaseClient } from '../clients/BaseClient';
import { Exception } from '../exceptions';
import { Request, RequestHandler, RequestOptions, Methods, routeBuilder } from '.';

export class RestManager {
	private readonly handlers = new Collection<string, RequestHandler>();
	public delay?: Promise<void>;
	public reset = -1;

	public constructor(public readonly client: BaseClient) {
		if (client.options.http.sweepInterval > 0) {
			client.setInterval(() => {
				this.handlers.sweep((handler) => handler.inactive);
			}, client.options.http.sweepInterval);
		}
	}

	public get api(): ReturnType<typeof routeBuilder> {
		return routeBuilder(this);
	}

	public get auth(): string {
		if (!this.client.token) {
			throw new Exception('TOKEN_MISSING');
		}
		return `${this.client.tokenType} ${this.client.token}`;
	}

	public request(
		method: Methods,
		url: string,
		options: RequestOptions,
	): Promise<Record<PropertyKey, unknown> | Buffer> {
		const request = new Request(this, method, url, options);

		let handler = this.handlers.get(options.route);
		if (!handler) {
			handler = new RequestHandler(this);
			this.handlers.set(options.route, handler);
		}

		return handler.push(request);
	}
}
