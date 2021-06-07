import { APIWebhook, Snowflake, WebhookType } from 'discord-api-types';
import { Client } from '../clients';
import { deconstruct } from '../utils/Snowflake';
import { TextChannel } from './channel/text/TextChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

/**
 * Structure representing a webhook
 */
export class Webhook {
	/**
	 * The id of the webhook
	 */
	public id!: Snowflake;

	/**
	 * THe type of webhook
	 */
	public type!: WebhookType;

	/**
	 * The guild id this webhook is for if any
	 */
	public guildId?: Snowflake;

	/**
	 * The channel id this webhook is for if any
	 */
	public channelId!: Snowflake;

	/**
	 * The user this webhook was created by
	 */
	public user?: User;

	/**
	 * The default name of the webhook
	 */
	public name?: string;

	/**
	 * The default user avatar hash of the webhook
	 */
	public avatar?: string;

	/**
	 * The secure token of the webhook
	 */
	public token?: string;

	/**
	 * The bot/OAuth2 application that created this webhook
	 */
	public applicationId?: Snowflake;

	/**
	 * The guild of the channel that this webhook is following (for channel follower webhooks)
	 */
	public sourceGuild?: Guild;

	/**
	 * The channel that this webhook is following (for channel follower webhooks)
	 */
	public sourceChannel?: TextChannel;

	/**
	 * The url used for executing the webhook (from webhooks OAuth2 flow)
	 */
	public url?: string;

	/**
	 * The timestamp when the webhook was created
	 */
	public createdTimestamp?: number;

	/**
	 * The date when the webhook was created
	 */
	public createdAt?: Date;

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
		this.createdTimestamp = deconstruct(this.id)?.timestamp;
		this.createdAt = this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}
}
