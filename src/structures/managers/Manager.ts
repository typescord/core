/* eslint-disable @typescript-eslint/no-explicit-any */
import Collection from '@discordjs/collection';
import { Client } from '../../clients';
import { Identifiable, Patchable } from '../interfaces';

function isPatchable(entry: any): entry is Patchable {
	return '$patch' in entry;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Manager<H, E, V, K> {
	/**
	 * Fetches the data from the Discord's API (or return the cached element, if `cache` is true).
	 *
	 * @param key The data's key (id, etc.).
	 * @param cache If the data should be cached (or cached data patched), `true` by default.
	 * @param checkCache If the cached data should be returned (if it exists) rather than fetching the data, `true` by default.
	 * @returns The the fetched (or cached) data, or `undefined` if not found.
	 */
	fetch?(key: K, cache?: boolean, checkCache?: boolean): Promise<V | undefined>;
}

// eslint-disable-next-line no-redeclare
export class Manager<
	H extends new (client: Client, data: any, ...args: any[]) => Identifiable<K>,
	E = H extends new (client: Client, data: any, ...args: infer R) => any ? R : never,
	V = H extends new (client: Client, data: any, ...args: any[]) => infer R ? R : never,
	K = V extends Identifiable<infer R> ? R : never,
> {
	/**
	 * The cache of the manager.
	 */
	public readonly cache = new Collection<K, V>();

	public constructor(public readonly client: Client, private readonly hold: H, private readonly extras?: E) {}

	/**
	 * Adds the data to the cache (or return the cached element, if `cache` is true).
	 *
	 * @param data The data to add.
	 * @param cache If the data should be cached (or cached data patched), `true` by default.
	 * @returns The resolved data.
	 */
	public add(data: Identifiable<K>, cache = true): V {
		const existing = this.cache.get(data.id);

		if (existing) {
			return cache && isPatchable(existing) ? existing.$patch(data) : existing;
		}

		const entry = new this.hold(this.client, data, ...((this.extras as any[] | undefined) ?? [])) as V &
			Identifiable<K>;

		if (cache) {
			this.cache.set(entry.id, entry);
		}

		return entry;
	}

	/**
	 * Resolves the data by its key from the cache.
	 *
	 * @param key The data's key (id, etc.).
	 * @returns The cached data or `undefined` if not found.
	 */
	public resolve(key: K): V | undefined {
		return this.cache.get(key);
	}
}
