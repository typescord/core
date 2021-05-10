import Collection from '@discordjs/collection';
import { APITeam, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { TeamMember } from './TeamMember';

export class Team {
	public icon?: string;
	public id!: Snowflake;
	public members = new Collection<Snowflake, TeamMember>();
	public ownerUserId!: Snowflake;

	public constructor(public readonly client: Client, data: APITeam) {
		this.$patch(data);
	}

	public $patch(data: APITeam): void {
		if (data.icon) {
			this.icon = data.icon;
		}

		for (const member of data.members.map((teamMember) => new TeamMember(this, teamMember))) {
			this.members.set(member.id, member);
		}

		this.id = data.id;
		this.ownerUserId = data.owner_user_id;
	}
}
