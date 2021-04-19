import merge from 'lodash.merge';
import { DeepRequired } from '../utils/types';
import { BaseClient, BaseClientOptions } from './BaseClient';

type ClientOptions = BaseClientOptions; // temporary

const defaultOptions: DeepRequired<ClientOptions> = {
	http: {
		requestTimeout: 10000,
		sweepInterval: 60000,
		retryLimit: 2,
		timeOffset: 0,
		http2: true,
		api: 'https://discord.com/api/v8',
	},
};

export class Client extends BaseClient {
	public readonly options!: DeepRequired<ClientOptions>;

	public constructor(options?: ClientOptions) {
		super('Bot', options ? merge(defaultOptions, options) : defaultOptions);
	}

	public login(token: string): void {
		super.token = token;
	}
}
