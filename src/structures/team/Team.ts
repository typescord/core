import Collection from '@discordjs/collection';
import { APITeam, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';
import { TeamMember } from './TeamMember';

/**
 * Structure representing a team
 */
export class Team {
	/**
	 * The icon hash of the team
	 */
	public icon?: string;

	/**
	 * The id of the team
	 */
	public id!: Snowflake;

	/**
	 * The members of the team
	 */
	public members = new Collection<Snowflake, TeamMember>();

	/**
	 * The id of the current team owner
	 */
	public ownerUserId!: Snowflake;

	/**
	 * The timestamp when the team was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the team was created
	 */
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APITeam) {
		this.$patch(data);
	}

	public $patch(data: APITeam): void {
		for (const member of data.members) {
			this.members.set(member.user.id, new TeamMember(this, member));
		}

		this.icon = data.icon ?? undefined;
		this.id = data.id;
		this.ownerUserId = data.owner_user_id;
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}
}
