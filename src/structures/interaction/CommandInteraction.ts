import Collection from '@discordjs/collection';
import {
	APIApplicationCommandGuildInteraction,
	APIApplicationCommandInteractionDataOption,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../../clients';
import { GuildChannel } from '../channel/GuildChannel';
import { GuildMember } from '../guild/GuildMember';
import { Role } from '../Role';
import { User } from '../User';
import { Interaction } from './Interaction';

/**
 * Structure representing a command interaction
 */
export class CommandInteraction extends Interaction {
	/**
	 * The id of the invoked command
	 */
	public id!: Snowflake;

	/**
	 * The name of the invoked command
	 */
	public name!: string;

	/**
	 * The params and values of the invoked command
	 */
	public options?: APIApplicationCommandInteractionDataOption[];

	/**
	 * The users involved in the invoked command
	 */
	public users = new Collection<Snowflake, User>();

	/**
	 * The roles involved in the invoked command
	 */
	public roles = new Collection<Snowflake, Role>();

	/**
	 * The members involved in the invoked command
	 */
	public members = new Collection<Snowflake, GuildMember>();

	/**
	 * The channels involved in the invoked command
	 */
	public channels = new Collection<Snowflake, GuildChannel>();

	public constructor(client: Client, data: APIApplicationCommandGuildInteraction) {
		super(client, data);

		this.$patch(data);
	}

	public $patch(data: APIApplicationCommandGuildInteraction): void {
		super.$patch(data);

		if (data.data.resolved?.users) {
			for (const id in data.data.resolved.users) {
				this.users.set(id as Snowflake, new User(this.client, data.data.resolved.users[id]));
			}
		}

		/*if (data.data.resolved?.roles) {
			for (const [id, role] of Object.entries(data.data.resolved.roles)) {
				this.roles.set(id as Snowflake, new Role(this.guild, role));
			}
		}

		if (data.data.resolved?.members) {
			for (const [id, member] of Object.entries(data.data.resolved.members)) {
				this.members.set(id as Snowflake, new GuildMember(this.guild, member));
			}
		}

		if (data.data.resolved?.channels) {
			for (const [id, channel] of Object.entries(data.data.resolved.channels)) {
				this.channels.set(id as Snowflake, new GuildChannel(this.guild, channel));
			}
		}*/

		this.id = data.data.id;
		this.name = data.data.name;
		this.options = data.data.options;
	}
}
