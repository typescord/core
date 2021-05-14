import { Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { user } from '../../http/routes';
import { User } from '../resources/User';
import { Manager } from './Manager';

export class UserManager extends Manager<typeof User> {
	public constructor(client: Client) {
		super(client, User);
	}

	public async fetch(id: Snowflake, cache?: boolean, checkCache = true): Promise<User> {
		const existing = checkCache && this.cache.get(id);
		return existing || this.add(await this.client.$request('get', user({ userId: id })), cache);
	}
}
