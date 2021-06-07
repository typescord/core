import { APIExtendedInvite, InviteTargetType } from 'discord-api-types';
import { Client } from '../clients';
import { Application } from './Application';
import { GuildChannel } from './channel/GuildChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

/**
 * Structure representing an invite to a guild or group DM channel
 */
export class Invite {
	/**
	 * The code of the invite
	 */
	public code!: string;

	/**
	 * The guild this invite is for
	 */
	public guild?: Guild;

	/**
	 * The channel this invite is for
	 */
	public channel?: GuildChannel;

	/**
	 * The user who created the invite
	 */
	public inviter?: User;

	/**
	 * The type of target for this voice channel invite
	 */
	public targetType?: InviteTargetType;

	/**
	 * The user whose stream to display for this voice channel stream invite
	 */
	public targetUser?: User;

	/**
	 * The embedded application to open for this voice channel embedded application invite
	 */
	public targetApplication?: Partial<Application>;

	/**
	 * The approximate count of online members
	 */
	public approximatePresenceCount?: number;

	/**
	 * The approximate count of total members
	 */
	public approximateMemberCount?: number;

	/**
	 * The number of times this invite has been used
	 */
	public uses!: number;

	/**
	 * The max number of times this invite can be used
	 */
	public maxUses!: number;

	/**
	 * The duration (in seconds) after which the invite expires
	 */
	public maxAge!: number;

	/**
	 * Whether or not this invite only grants temporary membership
	 */
	public temporary!: boolean;

	/**
	 * The timestamp when the invite was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the invite was created
	 */
	public createdAt!: Date;

	/**
	 * The timestamp when the invite expires
	 */
	public expiresTimestamp?: number;

	/**
	 * The date when the invite expires
	 */
	public expiresAt?: Date;

	public constructor(public readonly client: Client, data: APIExtendedInvite) {
		this.$patch(data);
	}

	public $patch(data: APIExtendedInvite): void {
		this.code = data.code;
		this.guild = data.guild && new Guild(this.client, data.guild);
		this.channel = this.guild && new GuildChannel(this.guild, data.channel);
		this.inviter = data.inviter && new User(this.client, data.inviter);
		this.targetType = data.target_type;
		this.targetUser = data.target_user && new User(this.client, data.target_user);
		this.targetApplication = data.target_application && new Application(this.client, data.target_application);
		this.approximatePresenceCount = data.approximate_presence_count;
		this.approximateMemberCount = data.approximate_member_count;
		this.uses = data.uses;
		this.maxUses = data.max_uses;
		this.maxAge = data.max_age;
		this.temporary = data.temporary;
		this.createdAt = new Date(data.created_at);
		this.createdTimestamp = this.createdAt.getTime();
		this.expiresTimestamp = this.temporary ? this.createdTimestamp + this.maxAge * 1000 : undefined;
		this.expiresAt = this.expiresTimestamp ? new Date(this.expiresTimestamp) : undefined;
	}
}
