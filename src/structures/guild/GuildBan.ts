import { APIBan } from 'discord-api-types';
import { User } from '../User';
import { Guild } from './Guild';

export class GuildBan {
	public reason?: string;
	public user!: User;

	public constructor(public readonly guild: Guild, data: APIBan) {
		this.$patch(data);
	}

	public $patch(data: APIBan): void {
		if (data.reason) {
			this.reason = data.reason;
		}

		this.user = new User(this.guild.client, data.user);
	}
}
