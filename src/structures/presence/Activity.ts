import {
	ActivityFlags,
	ActivityPlatform,
	ActivityType,
	APIPartialEmoji,
	GatewayActivity,
	Snowflake,
} from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { ActivityAssets } from './ActivityAssets';
import { Presence } from './Presence';

interface ActivityTimestamps {
	start?: number;
	end?: number;
}

interface ActivityParty {
	id?: string;
	size?: [currentSize: number, maxSize: number];
}

interface ActivitySecrets {
	join?: string;
	spectate?: string;
	match?: string;
}

interface ActivityButton {
	label: string;
	url: string;
}

export class Activity {
	public id!: string;
	public name!: string;
	public type!: ActivityType;
	public url?: string;
	public createdAt!: Date;
	public createdTimestamp!: number;
	public timestamps?: ActivityTimestamps;
	public syncId?: string;
	public platform?: ActivityPlatform;
	public applicationId?: Snowflake;
	public details?: string;
	public state?: string;
	public emoji?: Emoji;
	public sessionId?: string;
	public party?: ActivityParty;
	public assets?: ActivityAssets;
	public secrets?: ActivitySecrets;
	public instance?: boolean;
	public flags?: ActivityFlags;
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
		this.syncId = data.sync_id;
		this.platform = data.platform;
		this.applicationId = data.application_id;
		this.details = data.details ?? undefined;
		this.state = data.state ?? undefined;
		this.emoji = data.emoji && new Emoji(this.presence.client, data.emoji as APIPartialEmoji);
		this.sessionId = data.session_id;
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
