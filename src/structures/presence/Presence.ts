import type { GatewayPresenceUpdate, PresenceUpdateStatus } from 'discord-api-types/v8';
import type { Client, Snowflake } from '../..';
import { Activity } from './Activity';

interface PresenceClientStatus {
	desktop?: PresenceUpdateStatus;
	mobile?: PresenceUpdateStatus;
	web?: PresenceUpdateStatus;
}

export class Presence {
	public userId!: Snowflake;
	public guildid!: Snowflake;
	public status?: PresenceUpdateStatus;
	public activities?: Activity[];
	public clientStatus?: PresenceClientStatus;

	public constructor(public readonly client: Client, data: GatewayPresenceUpdate) {
		this.$patch(data);
	}

	public $patch(data: GatewayPresenceUpdate): void {
		this.userId = data.user.id;
		this.guildid = data.guild_id;
		this.status = data.status;
		this.activities = data.activities?.map((activity) => new Activity(this, activity));
		this.clientStatus = data.client_status;
	}
}
