import { BaseRequestOptions, RestManager, Routes } from '.';

export const methods = new Set(['get', 'post', 'delete', 'patch', 'put'] as const);
export const reflectors = new Set([
	'toString',
	'valueOf',
	'inspect',
	'constructor',
	Symbol.toPrimitive,
	Symbol.for('nodejs.util.inspect.custom'),
] as const);

type SetType<T extends Set<unknown>> = T extends Set<infer R> ? R : never;

export type Methods = SetType<typeof methods>;
export type Reflectors = SetType<typeof reflectors>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: Routes = ((() => {}) as unknown) as Routes;

export function routeBuilder(manager: RestManager): Routes {
	const route: string[] = [];

	const handler: ProxyHandler<Routes> = {
		get(_target, name: string) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if (reflectors.has(name as any)) {
				return () => route.join('/');
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if (methods.has(name as any)) {
				let finalRoute = '';
				for (let index = 0; index < route.length; index++) {
					// Reactions routes and sub-routes all share the same bucket
					if (route[index - 1] === 'reactions') {
						break;
					}

					finalRoute += `/${
						!(index - 1 === 0 && ['channels', 'guilds', 'webhooks'].includes(route[0])) &&
						/^\d{17,20}$/.test(route[index])
							? '::' // All other parts of the route should be considered as part of the bucket identifier
							: route[index] // Literal IDs should only be taken account if they are "Major" (Channel, Guild or Webhook ID + Token)
					}`;
				}

				return (options: BaseRequestOptions) =>
					manager.request(name as Methods, route.join('/'), {
						...options,
						route: finalRoute,
					});
			}

			route.push(name);
			return new Proxy(noop, handler);
		},
		apply(_target, _thisArg, [path]: [string | number]) {
			route.push(path.toString());
			return new Proxy(noop, handler);
		},
	};

	return new Proxy(noop, handler);
}
