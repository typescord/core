import { APIGuildIntegration, IntegrationExpireBehavior, Snowflake } from 'discord-api-types';
import { User } from '../User';
import { Guild } from './Guild';

type GuildInteractionType = 'twitch' | 'youtube' | 'discord';

interface IntegrationAccount {
	/**
	 * The id of the integration account
	 */
	id: string;

	/**
	 * The name of the integration account
	 */
	name: string;
}

interface GuildIntegrationApplication {
	/**
	 * The id of the application
	 */
	id: Snowflake;

	/**
	 * The name of the application
	 */
	name: string;

	/**
	 * The icon hash of the application
	 */
	icon?: string;

	/**
	 * The description of the application
	 */
	description: string;

	/**
	 * The summary of the application
	 */
	summary: string;

	/**
	 * The bot associated with the application
	 */
	bot?: User;
}

export class GuildIntegration {
	/**
	 * The id of the integration
	 */
	public id!: Snowflake;

	/**
	 * The name of the integration
	 */
	public name!: string;

	/**
	 * The type of the integration
	 */
	public type!: GuildInteractionType;

	/**
	 * Whether the integration si enabled
	 */
	public enabled!: boolean;

	/**
	 * Whether the integration is syncing
	 */
	public syncing?: boolean;

	/**
	 * The id that the integration uses for "subscribers"
	 */
	public roleId?: Snowflake;

	/**
	 * Whether emoticons should be synced for this integration
	 */
	public enableEmoticons?: boolean;

	/**
	 * The behavior of expiring subscribers
	 */
	public expireBehavior?: IntegrationExpireBehavior;

	/**
	 * The grace period (in days) before expiring subscribers
	 */
	public expireGracePeriod?: number;

	/**
	 * The user for the integration
	 */
	public user?: User;

	/**
	 * The account information of the integration
	 */
	public account!: IntegrationAccount;

	/**
	 * The date when the integration was last synced
	 */
	public syncedAt?: Date;

	/**
	 * The timestamp when the integration was last synced
	 */
	public syncedTimestamp?: number;

	/**
	 * How many subscribers the integration has
	 */
	public subscriberCount?: number;

	/**
	 * Whether the integration has been revoked
	 */
	public revoked?: boolean;

	/**
	 * The integration bot/OAuth2 application
	 */
	public application?: GuildIntegrationApplication;

	public constructor(public readonly guild: Guild, data: APIGuildIntegration) {
		this.$patch(data);
	}

	public $patch(data: APIGuildIntegration): void {
		this.id = data.id;
		this.name = data.name;
		this.type = data.type;
		this.enabled = data.enabled;
		this.syncing = data.syncing;
		this.roleId = data.role_id;
		this.enableEmoticons = data.enable_emoticons;
		this.expireBehavior = data.expire_behavior;
		this.expireGracePeriod = data.expire_grace_period;
		this.user = data.user && new User(this.guild.client, data.user);
		this.account = data.account;
		this.syncedAt = data.synced_at ? new Date(data.synced_at) : undefined;
		this.syncedTimestamp = this.syncedAt?.getTime();
		this.subscriberCount = data.subscriber_count;
		this.revoked = data.revoked;
		this.application = data.application && {
			...data.application,
			icon: data.application.icon ?? undefined,
			bot: data.application.bot ? new User(this.guild.client, data.application.bot) : undefined,
		};
	}
}
