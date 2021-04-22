import merge from 'lodash.merge';
import { WebSocketManager } from '../gateway/WebSocketManager';
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
	ws: {
		protocolVersion: 8,
		zlib: false,
	},
};

export class Client extends BaseClient {
	public readonly options!: DeepRequired<ClientOptions>;
	public webSocket = new WebSocketManager(this);

	public constructor(options?: ClientOptions) {
		super('Bot', options ? merge(defaultOptions, options) : defaultOptions);
	}

	public async login(token: string): Promise<void> {
		super.token = token;

		try {
      await this.webSocket.connect();
    } catch (error) {
      this.destroy();

      throw error;
    }
	}

	public destroy(): void {
    super.destroy();
    this.webSocket.destroy();
  }
}
