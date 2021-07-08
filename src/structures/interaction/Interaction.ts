import { APIApplicationCommandInteraction, InteractionType } from 'discord-api-types/v8';
import type { Client, Snowflake } from '../..';
import { getTimestamp } from '../../utils/snowflake';
import { GuildMember } from '../guild/GuildMember';
import { User } from '../User';

export class Interaction {
	public id!: Snowflake;
	public applicationId!: Snowflake;
	public type!: InteractionType;
	public channelId?: Snowflake;
	public token!: string;
	public version!: number;
	public createdTimestamp!: number;
	public createdAt!: Date;
	public guildId?: Snowflake;
	public member?: GuildMember;
	public user?: User;

	public constructor(public readonly client: Client, data: APIApplicationCommandInteraction) {
		this.$patch(data);
	}

	public $patch(data: APIApplicationCommandInteraction): void {
		this.id = data.id;
		this.applicationId = data.application_id;
		this.type = data.type;
		this.channelId = data.channel_id;
		this.token = data.token;
		this.version = data.version;
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);

		if ('guild_id' in data) {
			this.guildId = data.guild_id;
			// this.member = new GuildMember(guild, data.member);
		} else {
			this.user = new User(this.client, data.user);
		}
	}

	public isCommand(): boolean {
		return this.type === InteractionType.ApplicationCommand;
	}
}
