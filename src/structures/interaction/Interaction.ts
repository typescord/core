import { APIApplicationCommandInteraction, APIGuildInteraction, InteractionType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';
import { GuildMember } from '../guild/GuildMember';
import { User } from '../User';

function isGuildInteraction(data: any): data is APIGuildInteraction {
	return 'guild_id' in data;
}

export class Interaction {
	public id!: Snowflake;
	public applicationId!: Snowflake;
	public type!: InteractionType;
	public channelId?: Snowflake;
	public token!: string;
	public version!: number;
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

		if (isGuildInteraction(data)) {
			this.guildId = data.guild_id;
			// this.member = new GuildMember(guild, data.member);
		} else {
			this.user = new User(this.client, data.user);
		}
	}

	public get createdTimestamp(): number | undefined {
		return deconstruct(this.id)?.timestamp;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public isCommand(): boolean {
		return this.type === InteractionType.ApplicationCommand;
	}
}
