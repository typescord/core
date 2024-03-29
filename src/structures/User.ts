import type { APIUser, Snowflake, UserFlags, UserPremiumType } from 'discord-api-types/v8';
import { Client } from '../clients';
import { getTimestamp } from '../utils/snowflake';

export class User {
	public id!: Snowflake;
	public username!: string;
	public discriminator!: string;
	public tag!: string;
	public avatar?: string;
	public bot?: boolean;
	public system?: boolean;
	public locale?: string;
	public flags?: UserFlags;
	public publicFlags?: UserFlags;
	public mfaEnabled?: boolean;
	public verified?: boolean;
	public email?: string;
	public premiumType?: UserPremiumType;
	public createdTimestamp!: number;
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APIUser) {
		this.$patch(data);
	}

	public $patch(data: APIUser): void {
		this.id = data.id;
		this.username = data.username;
		this.discriminator = data.discriminator;
		this.tag = `${this.username}#${this.discriminator}`;
		this.avatar = data.avatar ?? undefined;
		this.bot = data.bot;
		this.system = data.system;
		this.locale = data.locale;
		this.flags = data.flags;
		this.publicFlags = data.public_flags;
		this.mfaEnabled = data.mfa_enabled;
		this.verified = data.verified;
		this.email = data.email ?? undefined;
		this.premiumType = data.premium_type;
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);
	}

	public equals(user: User): boolean {
		return (
			this.id === user.id &&
			this.username === user.username &&
			this.discriminator === user.discriminator &&
			this.avatar === user.avatar
		);
	}

	public toString(): string {
		return `<@${this.id}>`;
	}
}
