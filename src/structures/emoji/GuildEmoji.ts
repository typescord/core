import type { APIEmoji } from 'discord-api-types/v8';
import { User } from '../User';
import { BaseGuildEmoji } from './BaseGuildEmoji';

export class GuildEmoji extends BaseGuildEmoji {
	public author?: User;

	public $patch(data: APIEmoji): void {
		super.$patch(data);

		this.author = data.user && new User(this.client, data.user);
	}
}
