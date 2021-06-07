import { APIApplicationCommandInteraction, APIGuildInteraction, InteractionType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';
import { GuildMember } from '../guild/GuildMember';
import { User } from '../User';

function isGuildInteraction(data: any): data is APIGuildInteraction {
	return 'guild_id' in data;
}

/**
 * Structure representing an interaction
 */
export class Interaction {
	/**
	 * The id of the interaction
	 */
	public id!: Snowflake;

	/**
	 * The application id of the interaction is for
	 */
	public applicationId!: Snowflake;

	/**
	 * The type of the interaction
	 */
	public type!: InteractionType;

	/**
	 * The channel it was sent from
	 */
	public channelId?: Snowflake;

	/**
	 * The continuation token for responding to the interaction
	 */
	public token!: string;

	/**
	 * The integration version (always 1)
	 */
	public version!: number;

	/**
	 * The timestamp when the integration was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the integration was created
	 */
	public createdAt!: Date;

	/**
	 * The guild it was sent from
	 */
	public guildId?: Snowflake;

	/**
	 * The guild member data for the invoking user
	 */
	public member?: GuildMember;

	/**
	 * User object for the invoking user if invoked in a DM channel
	 */
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
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);

		if (isGuildInteraction(data)) {
			this.guildId = data.guild_id;
			// this.member = new GuildMember(guild, data.member);
		} else {
			this.user = new User(this.client, data.user);
		}
	}

	/**
	 * Whether the interaction is a command
	 *
	 * @returns true if it's a command interaction, false otherwise
	 */
	public isCommand(): boolean {
		return this.type === InteractionType.ApplicationCommand;
	}
}
