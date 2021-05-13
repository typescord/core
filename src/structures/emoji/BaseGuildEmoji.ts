import { APIEmoji, Snowflake } from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { Guild } from '../guild/Guild';
import { GuildPreview } from '../guild/GuildPreview';

export class BaseGuildEmoji extends Emoji {
	public requireColons?: boolean;
	public managed?: boolean;
	public available?: boolean;
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
