import Collection from '@discordjs/collection';
import { APIRole, Permissions, Snowflake } from 'discord-api-types';
import { deconstruct } from '../utils/Snowflake';
import { Guild } from './guild/Guild';
import { GuildMember } from './guild/GuildMember';

export interface RoleTags {
	botId?: Snowflake;
	integrationId?: Snowflake;
}

export class Role {
	public id!: Snowflake;
	public name!: string;
	public color!: number;
	public hexColor!: string;
	public hoist!: boolean;
	public position!: number;
	public permissions!: Permissions;
	public managed!: boolean;
	public mentionable!: boolean;
	public tags?: RoleTags;
	public createdTimestamp?: number;
	public createdAt?: Date;

	public constructor(public readonly guild: Guild, data: APIRole) {
		this.$patch(data);
	}

	public $patch(data: APIRole): void {
		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.hexColor = `#${this.color.toString(16).padStart(6, '0')}`;
		this.hoist = data.hoist;
		this.position = data.position;
		this.permissions = data.permissions;
		this.managed = data.managed;
		this.mentionable = data.mentionable;
		this.tags = data.tags && {
			botId: data.tags.bot_id,
			integrationId: data.tags.integration_id,
		};
		this.createdTimestamp = deconstruct(this.id)?.timestamp;
		this.createdAt = this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public get members(): Collection<Snowflake, GuildMember> | undefined {
		return this.guild.members.filter((member) => member.roles.includes(this.id));
	}

	public toString(): string {
		return this.id === this.guild.id ? '@everyone' : `<@&${this.id}>`;
	}
}
