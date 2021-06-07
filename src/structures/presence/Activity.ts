import { ActivityFlags, ActivityType, APIPartialEmoji, GatewayActivity, Snowflake } from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { ActivityAssets } from './ActivityAssets';
import { Presence } from './Presence';

interface ActivityTimestamps {
	/**
	 * The timestamp when the activity started
	 */
	start?: number;

	/**
	 * The timestamp when the activity ends
	 */
	end?: number;
}

interface ActivityParty {
	/**
	 * The id of the party
	 */
	id?: string;

	/**
	 * The current and maximum size of the party
	 */
	size?: [currentSize: number, maxSize: number];
}

interface ActivitySecrets {
	/**
	 * The secret for joining a party
	 */
	join?: string;

	/**
	 * The secret for spectating a game
	 */
	spectate?: string;

	/**
	 * The secret for a specific instanced match
	 */
	match?: string;
}

interface ActivityButton {
	/**
	 * The text shown on the button
	 */
	label: string;

	/**
	 * The url opened when clicking the button
	 */
	url: string;
}

/**
 * Structure representing a presence activity
 */
export class Activity {
	/**
	 * The id of the activity
	 */
	public id!: string;

	/**
	 * The name of the activity
	 */
	public name!: string;

	/**
	 * The type of activity
	 */
	public type!: ActivityType;

	/**
	 * The stream url if the type is "Streaming"
	 */
	public url?: string;

	/**
	 * The timestamp when the activity was added to the user's session
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the activity was added to the user's session
	 */
	public createdAt!: Date;

	/**
	 * The timestamp for start and/or end of the activity
	 */
	public timestamps?: ActivityTimestamps;

	/**
	 * The application id for the game
	 */
	public applicationId?: Snowflake;

	/**
	 * What the player is currently doing
	 */
	public details?: string;

	/**
	 * The current party status of the user
	 */
	public state?: string;

	/**
	 * The emoji used for a custom status
	 */
	public emoji?: Emoji;

	/**
	 * Information for the current party of the player
	 */
	public party?: ActivityParty;

	/**
	 * Images for the presence and their hover texts
	 */
	public assets?: ActivityAssets;

	/**
	 * Secrets for Rich Presence joining and spectating
	 */
	public secrets?: ActivitySecrets;

	/**
	 * Whether or not the activity is an instanced game session
	 */
	public instance?: boolean;

	/**
	 * The flags of the activity
	 */
	public flags?: ActivityFlags;

	/**
	 * The custom buttons shown in the Rich Presence
	 */
	public buttons?: string[] | ActivityButton[];

	public constructor(public readonly presence: Presence, data: GatewayActivity) {
		this.$patch(data);
	}

	public $patch(data: GatewayActivity): void {
		this.id = data.id;
		this.name = data.name;
		this.type = data.type;
		this.url = data.url ?? undefined;
		this.createdAt = new Date(data.created_at);
		this.createdTimestamp = this.createdAt.getTime();
		this.timestamps = data.timestamps;
		this.applicationId = data.application_id;
		this.details = data.details ?? undefined;
		this.state = data.state ?? undefined;
		this.emoji = data.emoji && new Emoji(this.presence.client, data.emoji as APIPartialEmoji);
		this.party = data.party;
		this.assets = data.assets && new ActivityAssets(this, data.assets);
		this.secrets = data.secrets;
		this.instance = data.instance;
		this.flags = data.flags;
		this.buttons = data.buttons;
	}

	public toString(): string {
		return this.name;
	}
}
