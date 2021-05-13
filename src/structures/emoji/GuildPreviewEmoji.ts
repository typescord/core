import { Snowflake } from 'discord-api-types';
import { BaseGuildEmoji } from './BaseGuildEmoji';

export class GuildPreviewEmoji extends BaseGuildEmoji {
	public get roles(): Set<Snowflake> {
		return new Set(this.roleIds);
	}
}
