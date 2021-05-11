import Collection from '@discordjs/collection';
import {
	APIGuild,
	APIPartialGuild,
	GatewayPresenceUpdate,
	GatewayVoiceState,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildFeature,
	GuildMFALevel,
	GuildPremiumTier,
	GuildSystemChannelFlags,
	GuildVerificationLevel,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';
import { GuildChannel } from '../channel/GuildChannel';
import { GuildEmoji } from '../emoji/GuildEmoji';
import { GuildMember } from '../guild/GuildMember';
import { Role } from '../Role';

interface GuildWelcomeScreen {
	description?: string;
	welcomeChannels: GuildWelcomeScreenChannel[];
}

interface GuildWelcomeScreenChannel {
	channelId: Snowflake;
	description: string;
	emojiId?: Snowflake;
	emojiName?: string;
}

function isAPIGuild(data: any): data is APIGuild {
	return 'description' in data;
}

export class Guild {
	public id!: string;
	public name!: string;
	public icon?: string;
	public splash?: string;
	public available!: boolean;
	public iconHash?: string;
	public discoverySplash?: string;
	public ownerId?: Snowflake;
	public afkChannelId?: Snowflake;
	public afkTimeout?: number;
	public widgetEnabled!: boolean;
	public widgetChannelId?: Snowflake;
	public verificationLevel?: GuildVerificationLevel;
	public defaultMessageNotifications?: GuildDefaultMessageNotifications;
	public explicitContentFilter?: GuildExplicitContentFilter;
	public roles = new Collection<Snowflake, Role>();
	public emojis = new Collection<Snowflake, GuildEmoji>();
	public features?: GuildFeature[];
	public mfaLevel?: GuildMFALevel;
	public applicationId?: Snowflake;
	public systemChannelId?: Snowflake;
	public systemChannelFlags?: GuildSystemChannelFlags;
	public rulesChannelId?: Snowflake;
	public joinedAt?: Date;
	public large!: boolean;
	public memberCount?: number;
	public voiceStates?: Omit<GatewayVoiceState, 'guild_id'>[];
	public members = new Collection<Snowflake, GuildMember>();
	public channels = new Collection<Snowflake, GuildChannel>();
	public presences?: GatewayPresenceUpdate[];
	public maxPresences?: number;
	public maxMembers?: number;
	public vanityUrlCode?: string;
	public description?: string;
	public banner?: string;
	public premiumTier?: GuildPremiumTier;
	public premiumSubscriptionCount?: number;
	public preferredLocale?: string;
	public publicUpdatesChannelId?: Snowflake;
	public approximateMemberCount?: number;
	public approximatePresenceCount?: number;
	public welcomeScreen?: GuildWelcomeScreen;
	public nsfw!: boolean;

	public constructor(public readonly client: Client, data: APIGuild | APIPartialGuild) {
		this.$patch(data);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public $patch(data: APIGuild | APIPartialGuild): void {
		if (data.icon) {
			this.icon = data.icon;
		}

		if (data.splash) {
			this.splash = data.splash;
		}

		if (data.vanity_url_code) {
			this.vanityUrlCode = data.vanity_url_code;
		}

		if (data.description) {
			this.description = data.description;
		}

		if (data.banner) {
			this.banner = data.banner;
		}

		if (data.welcome_screen) {
			this.welcomeScreen = {
				description: data.welcome_screen.description ?? undefined,
				welcomeChannels: data.welcome_screen.welcome_channels.map((welcomeChannel) => ({
					channelId: welcomeChannel.channel_id,
					description: welcomeChannel.description,
					emojiId: welcomeChannel.emoji_id ?? undefined,
					emojiName: welcomeChannel.emoji_name ?? undefined,
				})),
			};
		}

		this.id = data.id;
		this.name = data.name;
		this.available = !data.unavailable;
		this.verificationLevel = data.verification_level;
		this.features = data.features;

		if (isAPIGuild(data)) {
			if (data.icon_hash) {
				this.iconHash = data.icon_hash;
			}

			if (data.discovery_splash) {
				this.discoverySplash = data.discovery_splash;
			}

			if (data.afk_channel_id) {
				this.afkChannelId = data.afk_channel_id;
			}

			if (data.widget_channel_id) {
				this.widgetChannelId = data.widget_channel_id;
			}

			if (data.application_id) {
				this.applicationId = data.application_id;
			}

			if (data.system_channel_id) {
				this.applicationId = data.system_channel_id;
			}

			if (data.rules_channel_id) {
				this.rulesChannelId = data.rules_channel_id;
			}

			if (data.max_presences) {
				this.maxPresences = data.max_presences;
			}

			if (data.public_updates_channel_id) {
				this.publicUpdatesChannelId = data.public_updates_channel_id;
			}

			if (data.joined_at) {
				this.joinedAt = new Date(data.joined_at);
			}

			if (data.members) {
				for (const member of data.members) {
					this.members.set(member.user!.id, new GuildMember(this, member));
				}
			}

			if (data.channels) {
				for (const channel of data.channels) {
					this.channels.set(channel.id, new GuildChannel(this, channel));
				}
			}

			for (const emoji of data.emojis) {
				if (emoji.id) {
					this.emojis.set(emoji.id, new GuildEmoji(this, emoji));
				}
			}

			for (const role of data.roles) {
				this.roles.set(role.id, new Role(this, role));
			}

			this.ownerId = data.owner_id;
			this.afkTimeout = data.afk_timeout;
			this.widgetEnabled = !!data.widget_enabled;
			this.defaultMessageNotifications = data.default_message_notifications;
			this.explicitContentFilter = data.explicit_content_filter;
			this.mfaLevel = data.mfa_level;
			this.systemChannelFlags = data.system_channel_flags;
			this.large = !!data.large;
			this.memberCount = data.member_count;
			this.voiceStates = data.voice_states;
			this.presences = data.presences;
			this.maxMembers = data.max_members;
			this.premiumTier = data.premium_tier;
			this.premiumSubscriptionCount = data.premium_subscription_count;
			this.preferredLocale = data.preferred_locale;
			this.approximateMemberCount = data.approximate_member_count;
			this.approximatePresenceCount = data.approximate_presence_count;
			this.nsfw = data.nsfw;
		}
	}

	public get createdTimestamp(): number | undefined {
		return deconstruct(this.id)?.timestamp;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public toString(): string {
		return this.name;
	}
}
