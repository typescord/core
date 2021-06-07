import { APIEmoji, Snowflake } from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { Guild } from '../guild/Guild';
import { GuildPreview } from '../guild/GuildPreview';

/**
 * Structure representing the base of a guild emoji
 */
export class BaseGuildEmoji extends Emoji {
	/**
	 * Whether this emoji must be wrapped in colons
	 */
	public requireColons?: boolean;

	/**
	 * Whether this emoji is managed
	 */
	public managed?: boolean;

	/**
	 * Whether this emoji is animated
	 */
	public available?: boolean;

	/**
	 * The roles allowed to use this emoji
	 */
	public roleIds?: Snowflake[];

	public constructor(public readonly guild: Guild | GuildPreview, data: APIEmoji) {
		super(guild.client, data);
	}

	public $patch(data: APIEmoji): void {
		this.requireColons = data.require_colons;
		this.managed = data.managed;
		this.available = data.available;
		this.roleIds = data.roles;
	}
}
