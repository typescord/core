/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestPayload } from './HttpManager';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DynamicRoute<R = void, P extends RequestPayload | undefined = undefined> {
	majorParameter: 'guilds' | 'channels' | 'webhooks' | 'global';
	bucketRoute: string[];
	endpoint: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StaticRoute<R = void, P extends RequestPayload | undefined = undefined> = string & { _: never };

export function routify<
	R = void,
	P extends RequestPayload | undefined = undefined,
	K extends readonly string[] = readonly string[],
>(literals: TemplateStringsArray, ...keys: K) {
	return function (data: Record<K[number], string>): DynamicRoute<R, P> {
		const bucketRoute = [literals[0]];
		let majorParameter: DynamicRoute['majorParameter'] = 'global';
		let endpoint = literals[0];

		const firstParameter = bucketRoute[0];
		if (['guilds/', 'channels/'].includes(firstParameter)) {
			majorParameter = bucketRoute[0].slice(-1) as 'guilds' | 'channels';
		} else if (firstParameter === 'webhooks/' && keys[0] === 'webhookId' && keys[1] === 'webhookToken') {
			majorParameter = 'webhooks';
		}

		for (let index = 1; index < literals.length; index++) {
			const literal = literals[index];
			const key: K[number] = keys[index - 1];
			const value = data[key];

			endpoint += `${value}${literal}`;

			if (literals[2] === '/reactions/') {
				continue;
			}

			bucketRoute.push(key.endsWith('Id') ? ':id' : value, literal);
		}

		return {
			majorParameter,
			bucketRoute,
			endpoint,
		};
	};
}
