import Collection from '@discordjs/collection';
import { APITeam, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';
import { TeamMember } from './TeamMember';

export class Team {
	public icon?: string;
	public id!: Snowflake;
	public members = new Collection<Snowflake, TeamMember>();
	public ownerUserId!: Snowflake;
	public createdTimestamp!: number;
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
