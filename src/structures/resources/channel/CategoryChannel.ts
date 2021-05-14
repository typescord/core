import Collection from '@discordjs/collection';
import { Snowflake } from 'discord-api-types';
import { GuildChannel } from './GuildChannel';

export class CategoryChannel extends GuildChannel {
	public get children(): Collection<Snowflake, GuildChannel> | undefined {
		return this.guild.channels.filter((channel) => channel.parentId === this.id);
	}
}
