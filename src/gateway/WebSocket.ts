import { URLSearchParams } from 'url';
import BaseWebSocket from 'ws';

import { encoding } from '.';

export interface GatewayURLQuery {
	v: number;
	encoding?: typeof encoding;
	compress?: 'zlib-stream';
}

function craftGatewayAddress(gateway: string, partialQuery: Omit<GatewayURLQuery, 'encoding'>): string {
	const [gatewayAddress, gatewayQuery] = gateway.split('?');
	const query: GatewayURLQuery = {
		...partialQuery,
		encoding,
	};

	const queryParams = Object.entries(query);
	const urlSearchParams = new URLSearchParams(queryParams);

	if (gatewayQuery) {
		const gatewayQueryParams = Object.entries(gatewayQuery);

		for (const [key, value] of gatewayQueryParams) {
			urlSearchParams.set(key, value);
		}
	}

	return `${gatewayAddress}?${urlSearchParams}`;
}

export class WebSocket extends BaseWebSocket {
	public constructor(gateway: string, partialQuery: Omit<GatewayURLQuery, 'encoding'>) {
		const gatewayAddress = craftGatewayAddress(gateway, partialQuery);

		super(gatewayAddress);
	}
}
