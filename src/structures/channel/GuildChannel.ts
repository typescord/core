import { APIChannel, APIOverwrite, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { Channel } from './Channel';

export class GuildChannel extends Channel {
	public name?: string;
	public guildId?: Snowflake;
	public position?: number;
	public permissionOverwrites?: APIOverwrite[];
	public nsfw?: boolean;
	public parentId?: Snowflake;

	public constructor(public readonly guild: Guild, data: APIChannel) {
		super(guild.client, data);

		this.$patch(data);
	}

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.name = data.name;
		this.guildId = data.guild_id;
		this.position = data.position;
		this.permissionOverwrites = data.permission_overwrites;
		this.nsfw = data.nsfw;
		this.parentId = data.parent_id ?? undefined;
	}
}
