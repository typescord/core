import type { APIGuildIntegration, IntegrationExpireBehavior } from 'discord-api-types/v8';
import type { Snowflake } from '../..';
import { User } from '../User';
import { Guild } from './Guild';

type GuildInteractionType = 'twitch' | 'youtube' | 'discord';

interface IntegrationAccount {
	id: string;
	name: string;
}

interface GuildIntegrationApplication {
	id: Snowflake;
	name: string;
	icon?: string;
	description: string;
	summary: string;
	bot?: User;
}

export class GuildIntegration {
	public id!: Snowflake;
	public name!: string;
	public type!: GuildInteractionType;
	public enabled!: boolean;
	public syncing?: boolean;
	public roleId?: Snowflake;
	public enableEmoticons?: boolean;
	public expireBehavior?: IntegrationExpireBehavior;
	public expireGracePeriod?: number;
	public user?: User;
	public account!: IntegrationAccount;
	public syncedAt?: Date;
	public syncedTimestamp?: number;
	public subscriberCount?: number;
	public revoked?: boolean;
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
