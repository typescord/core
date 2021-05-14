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
		this.reason = data.reason ?? undefined;
		this.user = new User(this.guild.client, data.user);
	}
}
