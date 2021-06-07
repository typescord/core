import { GatewayPresenceUpdate, PresenceUpdateStatus, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { Activity } from './Activity';

interface PresenceClientStatus {
	/**
	 * The user's status set for an active desktop (Windows, Linux, Mac) application session
	 */
	desktop?: PresenceUpdateStatus;

	/**
	 * The user's status set for an active mobile (iOS, Android) application session
	 */
	mobile?: PresenceUpdateStatus;

	/**
	 * The user's status set for an active web (browser, bot account) application session
	 */
	web?: PresenceUpdateStatus;
}

/**
 * Structure representing the presence of a user
 */
export class Presence {
	/**
	 * the user's id presence is being updated for
	 */
	public userId!: Snowflake;

	/**
	 * The id of the guild
	 */
	public guildId!: Snowflake;

	/**
	 * The status of the presence
	 */
	public status?: PresenceUpdateStatus;

	/**
	 * The user's current activities
	 */
	public activities?: Activity[];

	/**
	 * The user's platform-dependent status
	 */
	public clientStatus?: PresenceClientStatus;

	public constructor(public readonly client: Client, data: GatewayPresenceUpdate) {
		this.$patch(data);
	}

	public $patch(data: GatewayPresenceUpdate): void {
		this.userId = data.user.id;
		this.guildId = data.guild_id;
		this.status = data.status;
		this.activities = data.activities?.map((activity) => new Activity(this, activity));
		this.clientStatus = data.client_status;
	}
}
