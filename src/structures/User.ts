import { APIUser, Snowflake, UserFlags, UserPremiumType } from 'discord-api-types';
import { Client } from '../clients';

export class User {
	public id!: Snowflake;
	public username!: string;
	public discriminator!: string;
	public avatar?: string;
	public bot!: boolean;
	public system!: boolean;
	public locale?: string;
	public flags?: UserFlags;
	public publicFlags?: UserFlags;
	public mfaEnabled!: boolean;
	public verified!: boolean;
	public email?: string;
	public premiumType?: UserPremiumType;

	public constructor(public readonly client: Client, data: APIUser) {
		this.$patch(data);
	}

	public $patch(data: APIUser): void {
		if (data.avatar) {
			this.avatar = data.avatar;
		}

		if (data.email) {
			this.email = data.email;
		}

		this.id = data.id;
		this.username = data.username;
		this.discriminator = data.discriminator;
		this.bot = !!data.bot;
		this.system = !!data.system;
		this.locale = data.locale;
		this.flags = data.flags;
		this.publicFlags = data.public_flags;
		this.mfaEnabled = !!data.mfa_enabled;
		this.verified = !!data.verified;
		this.premiumType = data.premium_type;
	}

	public get tag(): string {
		return `${this.username}#${this.discriminator}`;
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
