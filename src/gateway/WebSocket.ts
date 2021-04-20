import { URLSearchParams } from 'url';
import BaseWebSocket from 'ws';

import { encoding } from '.';

export interface GatewayConnectQuery {
	v: string | number;
	encoding?: typeof encoding;
	compress?: 'zlib-stream';
}

function craftGatewayAddress(gateway: string, partialQuery: GatewayConnectQuery): string {
	const [gatewayAddress, gatewayQuery] = gateway.split('?');
	const query: GatewayConnectQuery = {
		encoding,
		...partialQuery,
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
	public constructor(gateway: string, partialQuery: GatewayConnectQuery) {
		const gatewayAddress = craftGatewayAddress(gateway, partialQuery);

		super(gatewayAddress);
	}
}
