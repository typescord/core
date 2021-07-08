import type { Snowflake } from 'discord-api-types/v8';
import { BaseGuildEmoji } from './BaseGuildEmoji';

export class GuildPreviewEmoji extends BaseGuildEmoji {
	public get roles(): Set<Snowflake> {
		return new Set(this.roleIds);
	}
}
