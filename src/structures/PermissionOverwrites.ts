import { APIOverwrite, OverwriteType, Permissions, Snowflake } from 'discord-api-types';
import { GuildChannel } from './channel/GuildChannel';

/**
 * Structure representing a permission overwrite
 */
export class PermissionOverwrites {
	/**
	 * The id of the role or user
	 */
	public id!: Snowflake;

	/**
	 * The type of target (role or user)
	 */
	public type!: OverwriteType;

	/**
	 * The allow permission bit set
	 */
	public allow!: Permissions;

	/**
	 * The deny permission bit set
	 */
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
