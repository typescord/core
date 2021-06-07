import { Snowflake } from 'discord-api-types';
import { BaseGuildEmoji } from './BaseGuildEmoji';

/**
 * Structure representing a guild preview emoji
 */
export class GuildPreviewEmoji extends BaseGuildEmoji {
	public get roles(): Set<Snowflake> {
		return new Set(this.roleIds);
	}
}
