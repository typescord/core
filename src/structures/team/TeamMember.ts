import type { APITeamMember, TeamMemberMembershipState } from 'discord-api-types/v8';
import type { Snowflake } from '../..';
import { User } from '../User';
import { Team } from './Team';

export class TeamMember {
	public membershipState!: TeamMemberMembershipState;
	public permissions!: string[];
	public user!: User;

	public constructor(public readonly team: Team, data: APITeamMember) {
		this.$patch(data);
	}

	public $patch(data: APITeamMember): void {
		this.membershipState = data.membership_state;
		this.permissions = data.permissions;
		this.user = new User(this.team.client, data.user);
	}

	public get id(): Snowflake {
		return this.user.id;
	}
}
