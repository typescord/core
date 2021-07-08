import type { APIWebhook, WebhookType } from 'discord-api-types/v8';
import type { Client, Snowflake } from '..';
import { getTimestamp } from '../utils/snowflake';
import { TextChannel } from './channel/text/TextChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

export class Webhook {
	public id!: Snowflake;
	public type!: WebhookType;
	public guildId?: Snowflake;
	public channelId!: Snowflake;
	public user?: User;
	public name?: string;
	public avatar?: string;
	public token?: string;
	public applicationId?: Snowflake;
	public sourceGuild?: Guild;
	public sourceChannel?: TextChannel;
	public url?: string;
	public createdTimestamp!: number;
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APIWebhook) {
		this.$patch(data);
	}

	public $patch(data: APIWebhook): void {
		this.id = data.id;
		this.type = data.type;
		this.guildId = data.guild_id;
		this.channelId = data.channel_id;
		this.user = data.user && new User(this.client, data.user);
		this.name = data.name ?? undefined;
		this.avatar = data.avatar ?? undefined;
		this.token = data.token;
		this.applicationId = data.application_id ?? undefined;
		this.sourceGuild = data.source_guild && new Guild(this.client, data.source_guild);
		this.sourceChannel =
			this.sourceGuild && data.source_channel && new TextChannel(this.sourceGuild, data.source_channel);
		this.url = data.url;
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);
	}
}
