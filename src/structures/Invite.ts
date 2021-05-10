import { APIExtendedInvite, InviteTargetType } from 'discord-api-types';
import { Client } from '../clients';
import { Application } from './Application';
import { GuildChannel } from './channel/GuildChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

export class Invite {
	public code!: string;
	public guild?: Guild;
	public channel!: GuildChannel;
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

	public constructor(public readonly client: Client, data: APIExtendedInvite) {
		this.$patch(data);
	}

	public $patch(data: APIExtendedInvite): void {
		if (data.guild) {
			this.guild = new Guild(this.client, data.guild);
			this.channel = new GuildChannel(this.guild, data.channel);
		}

		if (data.inviter) {
			this.inviter = new User(this.client, data.inviter);
		}

		if (data.target_user) {
			this.targetUser = new User(this.client, data.target_user);
		}

		if (data.target_application) {
			this.targetApplication = new Application(this.client, data.target_application);
		}

		this.code = data.code;
		this.targetType = data.target_type;
		this.approximatePresenceCount = data.approximate_presence_count;
		this.approximateMemberCount = data.approximate_member_count;
		this.uses = data.uses;
		this.maxUses = data.max_uses;
		this.maxAge = data.max_age;
		this.temporary = data.temporary;
		this.createdAt = new Date(data.created_at);
	}

	public get createdTimestamp(): number {
		return this.createdAt.getTime();
	}

	public get expiresTimestamp(): number | undefined {
		return this.temporary ? this.createdTimestamp + this.maxAge * 1000 : undefined;
	}

	public get expiresAt(): Date | undefined {
		return this.expiresTimestamp ? new Date(this.expiresTimestamp) : undefined;
	}
}
