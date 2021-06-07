import { APIBan } from 'discord-api-types';
import { User } from '../User';
import { Guild } from './Guild';

/**
 * Structure representing a guild ban
 */
export class GuildBan {
	/**
	 * The reason of the ban
	 */
	public reason?: string;

	/**
	 * The banned user
	 */
	public user!: User;

	public constructor(public readonly guild: Guild, data: APIBan) {
		this.$patch(data);
	}

	public $patch(data: APIBan): void {
		this.reason = data.reason ?? undefined;
		this.user = new User(this.guild.client, data.user);
	}
}
