import { APIEmoji } from 'discord-api-types';
import { User } from '../User';
import { BaseGuildEmoji } from './BaseGuildEmoji';

export class GuildEmoji extends BaseGuildEmoji {
	public author?: User;

	public $patch(data: APIEmoji): void {
		super.$patch(data);

		this.author = data.user && new User(this.client, data.user);
	}
}
