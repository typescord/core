import {
	APITemplate,
	ChannelType,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildSystemChannelFlags,
	GuildVerificationLevel,
	OverwriteType,
	Permissions,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../../clients';
import { User } from './User';

interface TemplateSerializedSourceGuild {
	description?: string;
	preferredLocale: string;
	iconHash?: string;
	name: string;
	region?: string;
	verificationLevel?: GuildVerificationLevel;
	defaultMessageNotifications?: GuildDefaultMessageNotifications;
	explicitContentFilter?: GuildExplicitContentFilter;
	roles?: GuildCreateRole[];
	channels?: GuildCreatePartialChannel[];
	afkChannelId?: number | Snowflake;
	afkTimeout?: number;
	systemChannelId?: number | Snowflake;
	systemChannelFlags?: GuildSystemChannelFlags;
}

interface GuildCreateRole {
	name?: string;
	permissions?: Permissions;
	color?: number;
	hoist?: boolean;
	mentionable?: boolean;
	id: number | string;
}

interface GuildCreatePartialChannel {
	type?: ChannelType;
	topic?: string;
	nsfw?: boolean;
	bitrate?: number;
	userLimit?: number;
	rateLimitPerUser?: number;
	name: string;
	id?: number | string;
	parentId?: number | string;
	permissionOverwrites?: GuildCreateOverwrite[];
}

interface GuildCreateOverwrite {
	allow: Permissions;
	deny: Permissions;
	type: OverwriteType;
	id: number | string;
}

export class Template {
	public code!: string;
	public name!: string;
	public description?: string;
	public usageCount!: number;
	public creatorId!: Snowflake;
	public creator!: User;
	public createdAt!: Date;
	public createdTimestamp!: number;
	public updatedAt!: Date;
	public updatedTimestamp!: number;
	public sourceGuildId!: Snowflake;
	public serializedSourceGuild!: TemplateSerializedSourceGuild;
	public isDirty?: boolean;

	public constructor(public readonly client: Client, data: APITemplate) {
		this.$patch(data);
	}

	public $patch(data: APITemplate): void {
		this.code = data.code;
		this.name = data.name;
		this.description = data.description ?? undefined;
		this.usageCount = data.usage_count;
		this.creatorId = data.creator_id;
		this.creator = new User(this.client, data.creator);
		this.createdAt = new Date(data.created_at);
		this.createdTimestamp = this.createdAt.getTime();
		this.updatedAt = new Date(data.updated_at);
		this.updatedTimestamp = this.updatedAt.getTime();
		this.sourceGuildId = data.source_guild_id;
		this.serializedSourceGuild = {
			description: data.serialized_source_guild.description ?? undefined,
			preferredLocale: data.serialized_source_guild.preferred_locale,
			iconHash: data.serialized_source_guild.icon_hash ?? undefined,
			name: data.serialized_source_guild.name,
			region: data.serialized_source_guild.region,
			verificationLevel: data.serialized_source_guild.verification_level,
			defaultMessageNotifications: data.serialized_source_guild.default_message_notifications,
			explicitContentFilter: data.serialized_source_guild.explicit_content_filter,
			roles: data.serialized_source_guild.roles?.map((role) => ({
				name: role.name ?? undefined,
				permissions: role.permissions ?? undefined,
				color: role.color ?? undefined,
				hoist: role.hoist ?? undefined,
				mentionable: role.mentionable ?? undefined,
				id: role.id,
			})),
			channels: data.serialized_source_guild.channels?.map((channel) => ({
				type: channel.type,
				topic: channel.topic ?? undefined,
				nsfw: channel.nsfw,
				bitrate: channel.bitrate,
				userLimit: channel.user_limit,
				rateLimitPerUser: channel.rate_limit_per_user,
				name: channel.name,
				id: channel.id,
				parentId: channel.parent_id ?? undefined,
				permissionOverwrites: channel.permission_overwrites,
			})),
			afkChannelId: data.serialized_source_guild.afk_channel_id ?? undefined,
			afkTimeout: data.serialized_source_guild.afk_timeout,
			systemChannelId: data.serialized_source_guild.system_channel_id ?? undefined,
			systemChannelFlags: data.serialized_source_guild.system_channel_flags,
		};
		this.isDirty = data.is_dirty ?? undefined;
	}
}
