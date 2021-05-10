import Collection from '@discordjs/collection';
import { APIRole, Permissions, Snowflake } from 'discord-api-types';
import { Guild } from './guild/Guild';
import { GuildMember } from './guild/GuildMember';

interface RoleTags {
	botId?: Snowflake;
	integrationId?: Snowflake;
}

export class Role {
	public id!: Snowflake;
	public name!: string;
	public color!: number;
	public hoist!: boolean;
	public position!: number;
	public permissions!: Permissions;
	public managed!: boolean;
	public mentionable!: boolean;
	public tags?: RoleTags;

	public constructor(public readonly guild: Guild, data: APIRole) {
		this.$patch(data);
	}

	public $patch(data: APIRole): void {
		if (data.tags) {
			this.tags = {
				botId: data.tags.bot_id,
				integrationId: data.tags.integration_id,
			};
		}

		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.hoist = data.hoist;
		this.position = data.position;
		this.permissions = data.permissions;
		this.managed = data.managed;
		this.mentionable = data.mentionable;
	}

	public get hexColor(): string {
		return `#${this.color.toString(16).padStart(6, '0')}`;
	}

	public get members(): Collection<Snowflake, GuildMember> | undefined {
		return this.guild.members.filter((member) => member.roles.includes(this.id));
	}

	public toString(): string {
		return this.id === this.guild.id ? '@everyone' : `<@&${this.id}>`;
	}
}
