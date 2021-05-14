import { Client } from '../../clients';
import { Guild } from '../resources/guild/Guild';
import { GuildMember } from '../resources/guild/GuildMember';
import { Manager } from './Manager';

export class GuildMemberManager extends Manager<typeof GuildMember> {
	public constructor(client: Client, public readonly guild: Guild) {
		super(client, GuildMember, [guild]);
	}
}
