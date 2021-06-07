import { APIChannel, APIOverwrite, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { Channel } from './Channel';

/**
 * Structure representing any kind of guild channel
 */
export class GuildChannel extends Channel {
	/**
	 * The name of the channel
	 */
	public name?: string;

	/**
	 * The guild id of the channel
	 */
	public guildId?: Snowflake;

	/**
	 * Sorting position of the channel
	 */
	public position?: number;

	/**
	 * Explicit permission overwrites for members and roles
	 */
	public permissionOverwrites?: APIOverwrite[];

	/**
	 * Whether the channel is nsfw
	 */
	public nsfw?: boolean;

	/**
	 * The id of the channel parent category
	 */
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
