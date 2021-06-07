import Collection from '@discordjs/collection';
import {
	APIGuild,
	APIPartialGuild,
	GatewayPresenceUpdate,
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
import { VoiceState } from '../voice/VoiceState';

interface GuildWelcomeScreen {
	/**
	 * The guild description shown in the welcome screen
	 */
	description?: string;

	/**
	 * The channels shown in the welcome screen
	 */
	welcomeChannels: GuildWelcomeScreenChannel[];
}

interface GuildWelcomeScreenChannel {
	/**
	 * The id of the guild welcome screen channel
	 */
	channelId: Snowflake;

	/**
	 * The description shown for the guild welcome screen channel
	 */
	description: string;

	/**
	 * The id of the emoji if it's a custom emoji
	 */
	emojiId?: Snowflake;

	/**
	 * The name of the emoji if it's a custom emoji
	 */
	emojiName?: string;
}

function isAPIGuild(data: any): data is APIGuild {
	return 'description' in data;
}

/**
 * Structure representing a guild
 */
export class Guild {
	/**
	 * The id of the guild
	 */
	public id!: string;

	/**
	 * The name of the guild
	 */
	public name!: string;

	/**
	 * The icon hash of the guild
	 */
	public icon?: string;

	/**
	 * The splash hash of the guild
	 */
	public splash?: string;

	/**
	 * Whether the guild is available
	 */
	public available!: boolean;

	/**
	 * The icon hash of the guild if it's in a template object
	 */
	public iconHash?: string;

	/**
	 * The discovery splash hash of the guild
	 */
	public discoverySplash?: string;

	/**
	 * The id of the guild owner
	 */
	public ownerId?: Snowflake;

	/**
	 * The id of the afk channel
	 */
	public afkChannelId?: Snowflake;

	/**
	 * The afk timeout of the guild in seconds
	 */
	public afkTimeout?: number;

	/**
	 * Whether the server widget is enabled
	 */
	public widgetEnabled?: boolean;

	/**
	 * The channel id that the widget will generate an invite to
	 */
	public widgetChannelId?: Snowflake;

	/**
	 * The verification level required for the guild
	 */
	public verificationLevel?: GuildVerificationLevel;

	/**
	 * The default message notifications level of the guild
	 */
	public defaultMessageNotifications?: GuildDefaultMessageNotifications;

	/**
	 * The explicit content filter level of the guild
	 */
	public explicitContentFilter?: GuildExplicitContentFilter;

	/**
	 * The roles in the guild
	 */
	public roles = new Collection<Snowflake, Role>();

	/**
	 * The custom guild emojis
	 */
	public emojis = new Collection<Snowflake, GuildEmoji>();

	/**
	 * The enabled guild features
	 */
	public features?: GuildFeature[];

	/**
	 * The required MFA level for the guild
	 */
	public mfaLevel?: GuildMFALevel;

	/**
	 * The application id of the guild creator if it is bot-created
	 */
	public applicationId?: Snowflake;

	/**
	 * The id of the channel where guild notices such as welcome messages and boost events are posted
	 */
	public systemChannelId?: Snowflake;

	/**
	 * The system channel flags in the guild
	 */
	public systemChannelFlags?: GuildSystemChannelFlags;

	/**
	 * The id of the channel where community guilds can display rules and/or guidelines
	 */
	public rulesChannelId?: Snowflake;

	/**
	 * The date when the guild was joined at
	 */
	public joinedAt?: Date;

	/**
	 * Whether the guild is considered as large
	 */
	public large?: boolean;

	/**
	 * The total number of members in the guild
	 */
	public memberCount?: number;

	/**
	 * The states of members currently in voice channels
	 */
	public voiceStates?: VoiceState[];

	/**
	 * The users in the guild
	 */
	public members = new Collection<Snowflake, GuildMember>();

	/**
	 * The channels in the guild
	 */
	public channels = new Collection<Snowflake, GuildChannel>();

	/**
	 * Presences of the members in the guild
	 */
	public presences?: GatewayPresenceUpdate[];

	/**
	 * The maximum number of presences for the guild
	 */
	public maxPresences?: number;

	/**
	 * The maximum number of members for the guild
	 */
	public maxMembers?: number;

	/**
	 * The vanity url code for the guild
	 */
	public vanityUrlCode?: string;

	/**
	 * The description of a community guild
	 */
	public description?: string;

	/**
	 * The banner hash of the guild
	 */
	public banner?: string;

	/**
	 * The premium tier of the guild
	 */
	public premiumTier?: GuildPremiumTier;

	/**
	 * The number of boosts the guild currently has
	 */
	public premiumSubscriptionCount?: number;

	/**
	 * The preferred locale of a community guild
	 */
	public preferredLocale?: string;

	/**
	 * The id of the channel where admins and moderators of community guilds receive notices from Discord
	 */
	public publicUpdatesChannelId?: Snowflake;

	/**
	 * The approximate number of members in this guild
	 */
	public approximateMemberCount?: number;

	/**
	 * The approximate number of non-offline members in this guild
	 */
	public approximatePresenceCount?: number;

	/**
	 * The welcome screen of a community guild
	 */
	public welcomeScreen?: GuildWelcomeScreen;

	/**
	 * Whether the guild is NSFW
	 */
	public nsfw!: boolean;

	/**
	 * The timestamp when the guild was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the guild was created
	 */
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APIGuild | APIPartialGuild) {
		this.$patch(data);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public $patch(data: APIGuild | APIPartialGuild): void {
		this.id = data.id;
		this.name = data.name;
		this.icon = data.icon ?? undefined;
		this.splash = data.splash ?? undefined;
		this.available = !data.unavailable;
		this.verificationLevel = data.verification_level;
		this.features = data.features;
		this.vanityUrlCode = data.vanity_url_code ?? undefined;
		this.description = data.description ?? undefined;
		this.banner = data.banner ?? undefined;
		this.welcomeScreen = data.welcome_screen && {
			description: data.welcome_screen.description ?? undefined,
			welcomeChannels: data.welcome_screen.welcome_channels.map((welcomeChannel) => ({
				channelId: welcomeChannel.channel_id,
				description: welcomeChannel.description,
				emojiId: welcomeChannel.emoji_id ?? undefined,
				emojiName: welcomeChannel.emoji_name ?? undefined,
			})),
		};
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);

		if (isAPIGuild(data)) {
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

			this.iconHash = data.icon_hash ?? undefined;
			this.discoverySplash = data.discovery_splash ?? undefined;
			this.ownerId = data.owner_id;
			this.afkChannelId = data.afk_channel_id ?? undefined;
			this.afkTimeout = data.afk_timeout;
			this.widgetEnabled = data.widget_enabled;
			this.widgetChannelId = data.widget_channel_id ?? undefined;
			this.defaultMessageNotifications = data.default_message_notifications;
			this.explicitContentFilter = data.explicit_content_filter;
			this.mfaLevel = data.mfa_level;
			this.applicationId = data.application_id ?? undefined;
			this.systemChannelId = data.system_channel_id ?? undefined;
			this.systemChannelFlags = data.system_channel_flags;
			this.rulesChannelId = data.rules_channel_id ?? undefined;
			this.joinedAt = data.joined_at ? new Date(data.joined_at) : undefined;
			this.large = data.large;
			this.memberCount = data.member_count;
			this.voiceStates = data.voice_states?.map((voiceState) => new VoiceState(this, voiceState));
			this.presences = data.presences;
			this.maxPresences = data.max_presences ?? undefined;
			this.maxMembers = data.max_members;
			this.premiumTier = data.premium_tier;
			this.premiumSubscriptionCount = data.premium_subscription_count;
			this.preferredLocale = data.preferred_locale;
			this.publicUpdatesChannelId = data.public_updates_channel_id ?? undefined;
			this.approximateMemberCount = data.approximate_member_count;
			this.approximatePresenceCount = data.approximate_presence_count;
			this.nsfw = data.nsfw;
		}
	}

	public toString(): string {
		return this.name;
	}
}
