import type { APIOverwrite, OverwriteType, Permissions } from 'discord-api-types/v8';
import { Snowflake } from '..';
import { GuildChannel } from './channel/GuildChannel';

export class PermissionOverwrites {
	public id!: Snowflake;
	public type!: OverwriteType;
	public allow!: Permissions;
	public deny!: Permissions;

	public constructor(public readonly guildChannel: GuildChannel, data: APIOverwrite) {
		this.$patch(data);
	}

	public $patch(data: APIOverwrite): void {
		this.id = data.id;
		this.type = data.type;
		this.allow = data.allow;
		this.deny = data.deny;
	}
}
