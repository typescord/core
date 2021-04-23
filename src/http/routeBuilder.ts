import { Snowflake } from 'discord-api-types';
import { BaseRequestOptions, HttpManager, Routes } from '.';

const methods = new Set(['get', 'post', 'delete', 'patch', 'put'] as const);
const reflectors = new Set([
	'toString',
	'valueOf',
	'inspect',
	'constructor',
	Symbol.toPrimitive,
	Symbol.for('nodejs.util.inspect.custom'),
]);

export type Methods = typeof methods extends Set<infer T> ? T : never;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: Routes = ((() => {}) as unknown) as Routes;

export function routeBuilder(manager: HttpManager): Routes {
	const route: string[] = [];

	const handler: ProxyHandler<Routes> = {
		// real name's type is string | symbol | Methods, but to avoid
		// useless typings and castings, it's typed as string | Methods.
		get(_target, name: string | Methods) {
			if (reflectors.has(name)) {
				return () => route.join('/');
			}

			if (methods.has(name as Methods)) {
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
		apply(_target, _thisArg, [path]: [Snowflake | string | number]) {
			route.push(path.toString());
			return new Proxy(noop, handler);
		},
	};

	return new Proxy(noop, handler);
}
