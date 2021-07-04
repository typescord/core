/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Method } from './HttpManager';

export type RouteType = {
	[K in Method]?: {
		r?: unknown;
		p?: unknown;
		q?: unknown;
	};
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DynamicRoute<R extends RouteType | undefined = undefined> {
	majorParameter: string;
	bucketRoute: string[];
	endpoint: string;
	messageId: string | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StaticRoute<R extends RouteType | undefined = undefined> = string & { _: never };

// TODO: simplify this when TypeScript will CORRECTLY infer some types (https://github.com/microsoft/TypeScript/issues/10571)
// eslint-disable-next-line sonarjs/cognitive-complexity
export function routify<R extends RouteType | undefined = undefined, K extends string = string>(
	literals: TemplateStringsArray,
	...keys: [K, ...K[]]
): (data: Record<K, string>) => DynamicRoute<R> {
	const bucketRoute = [literals[0]];
	for (let index = 1; index < literals.length; index++) {
		const literal = literals[index];
		const key = keys[index - 1];

		bucketRoute.push(key.endsWith('Id') ? ':id' : '', literal);

		if (literal === '/reactions/') {
			break;
		}
	}

	let majorParameter = 'global';
	const firstParameter = bucketRoute[0];

	return function (data: Record<K, string>): DynamicRoute<R> {
		let endpoint = literals[0];

		if (firstParameter === 'guilds/' || firstParameter === 'channels/') {
			majorParameter = data[keys[0]];
		} else if (firstParameter === 'webhooks/' && keys[0] === 'webhookId' && keys[1] === 'webhookToken') {
			majorParameter = (data as any).webhookId + (data as any).webhookToken;
		}

		for (let index = 1; index < literals.length; index++) {
			const literal = literals[index];
			const key = keys[index - 1];
			const value = data[key];

			endpoint += `${value}${literal}`;

			if (literals[2] !== '/reactions/' && !key.endsWith('Id')) {
				bucketRoute[index * 2 - 1] = value;
			}
		}

		return {
			majorParameter,
			bucketRoute,
			endpoint,
			messageId: (data as any).messageId,
		};
	};
}
