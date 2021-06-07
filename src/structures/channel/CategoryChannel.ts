import Collection from '@discordjs/collection';
import { Snowflake } from 'discord-api-types';
import { GuildChannel } from './GuildChannel';

/**
 * Structure representing a guild category channel
 */
export class CategoryChannel extends GuildChannel {
	/**
	 * The guild channels in the category
	 */
	public get children(): Collection<Snowflake, GuildChannel> | undefined {
		return this.guild.channels.filter((channel) => channel.parentId === this.id);
	}
}
