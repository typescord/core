import { APIExtendedInvite, InviteTargetType } from 'discord-api-types';
import { Client } from '../../clients';
import { Application } from './Application';
import { GuildChannel } from './channel/GuildChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

export class Invite {
	public code!: string;
	public guild?: Guild;
	public channel?: GuildChannel;
	public inviter?: User;
	public targetType?: InviteTargetType;
	public targetUser?: User;
	public targetApplication?: Partial<Application>;
	public approximatePresenceCount?: number;
	public approximateMemberCount?: number;
	public uses!: number;
	public maxUses!: number;
	public maxAge!: number;
	public temporary!: boolean;
	public createdAt!: Date;
	public createdTimestamp!: number;
	public expiresTimestamp?: number;
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
