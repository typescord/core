import { APITeamMember, Snowflake, TeamMemberMembershipState } from 'discord-api-types';
import { User } from '../User';
import { Team } from './Team';

/**
 * Structure representing a team member
 */
export class TeamMember {
	/**
	 * the user's membership state on the team
	 */
	public membershipState!: TeamMemberMembershipState;

	/**
	 * The permissions of the team member
	 */
	public permissions!: string[];

	/**
	 * The user the team member represents
	 */
	public user!: User;

	public constructor(public readonly team: Team, data: APITeamMember) {
		this.$patch(data);
	}

	public $patch(data: APITeamMember): void {
		this.membershipState = data.membership_state;
		this.permissions = data.permissions;
		this.user = new User(this.team.client, data.user);
	}

	/**
	 * The id of the user
	 */
	public get id(): Snowflake {
		return this.user.id;
	}
}
