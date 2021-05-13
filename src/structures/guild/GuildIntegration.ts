import { APIGuildIntegration, IntegrationExpireBehavior, Snowflake } from 'discord-api-types';
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
	public syncing!: boolean;
	public roleId?: Snowflake;
	public enableEmoticons!: boolean;
	public expireBehavior?: IntegrationExpireBehavior;
	public expireGracePeriod?: number;
	public user?: User;
	public account!: IntegrationAccount;
	public syncedAt?: Date;
	public subscriberCount?: number;
	public revoked!: boolean;
	public application?: GuildIntegrationApplication;

	public constructor(public readonly guild: Guild, data: APIGuildIntegration) {
		this.$patch(data);
	}

	public $patch(data: APIGuildIntegration): void {
		if (data.user) {
			this.user = new User(this.guild.client, data.user);
		}

		if (data.application) {
			this.application = {
				...data.application,
				icon: data.application.icon ?? undefined,
				bot: data.application.bot ? new User(this.guild.client, data.application.bot) : undefined,
			};
		}

		if (data.synced_at) {
			this.syncedAt = new Date(data.synced_at);
		}

		this.id = data.id;
		this.name = data.name;
		this.type = data.type;
		this.enabled = data.enabled;
		this.syncing = !!data.syncing;
		this.roleId = data.role_id;
		this.enableEmoticons = !!data.enable_emoticons;
		this.expireBehavior = data.expire_behavior;
		this.expireGracePeriod = data.expire_grace_period;
		this.account = data.account;
		this.subscriberCount = data.subscriber_count;
		this.revoked = !!data.revoked;
	}
}
