import Collection from '@discordjs/collection';
import { APIRole, Permissions, Snowflake } from 'discord-api-types';
import { deconstruct } from '../utils/Snowflake';
import { Guild } from './guild/Guild';
import { GuildMember } from './guild/GuildMember';

export interface RoleTags {
	botId?: Snowflake;
	integrationId?: Snowflake;
}

/**
 * Structure representing a guild role
 */
export class Role {
	/**
	 * The id of the role
	 */
	public id!: Snowflake;

	/**
	 * The name of the role
	 */
	public name!: string;

	/**
	 * The decimal color code of the role
	 */
	public color!: number;

	/**
	 * Whether or not this role is pinned in the user listing
	 */
	public hoist!: boolean;

	/**
	 * The position of the role
	 */
	public position!: number;

	/**
	 * The permission bit set of the role
	 */
	public permissions!: Permissions;

	/**
	 * Whether or not this role is managed by an integration
	 */
	public managed!: boolean;

	/**
	 * Whether or not this role is mentionable
	 */
	public mentionable!: boolean;

	/**
	 * The tags of the role
	 */
	public tags?: RoleTags;

	/**
	 * The timestamp when the role was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the role was created
	 */
	public createdAt!: Date;

	public constructor(public readonly guild: Guild, data: APIRole) {
		this.$patch(data);
	}

	public $patch(data: APIRole): void {
		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.hoist = data.hoist;
		this.position = data.position;
		this.permissions = data.permissions;
		this.managed = data.managed;
		this.mentionable = data.mentionable;
		this.tags = data.tags && {
			botId: data.tags.bot_id,
			integrationId: data.tags.integration_id,
		};
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}

	/**
	 * The hexadecimal color code of the role
	 */
	public get hexColor(): string {
		return `#${this.color.toString(16).padStart(6, '0')}`;
	}

	/**
	 * The members having this role
	 */
	public get members(): Collection<Snowflake, GuildMember> | undefined {
		return this.guild.members.filter((member) => member.roles.includes(this.id));
	}

	public toString(): string {
		return this.id === this.guild.id ? '@everyone' : `<@&${this.id}>`;
	}
}
