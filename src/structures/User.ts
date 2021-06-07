import { APIUser, Snowflake, UserFlags, UserPremiumType } from 'discord-api-types';
import { Client } from '../clients';
import { deconstruct } from '../utils/Snowflake';

/**
 * Structure representing a user
 */
export class User {
	/**
	 * The id of the user
	 */
	public id!: Snowflake;

	/**
	 * THe username of the user
	 */
	public username!: string;

	/**
	 * The 4-digit discord-tag of the user
	 */
	public discriminator!: string;

	/**
	 * The tag of the user (combination of username + discord-tag)
	 */
	public tag!: string;

	/**
	 * THe avatar hash of the user
	 */
	public avatar?: string;

	/**
	 * Whether or not the user belongs to an OAuth2 application
	 */
	public bot?: boolean;

	/**
	 * Whether or not the user is an Official Discord System user
	 */
	public system?: boolean;

	/**
	 * The chosen language option of the user
	 */
	public locale?: string;

	/**
	 * The flags on the user's account
	 */
	public flags?: UserFlags;

	/**
	 * The public flags on the user's account
	 */
	public publicFlags?: UserFlags;

	/**
	 * Whether or not the user has two factor enabled on their account
	 */
	public mfaEnabled?: boolean;

	/**
	 * Whether or not the email on the user's account has been verified
	 */
	public verified?: boolean;

	/**
	 * The email of the user
	 */
	public email?: string;

	/**
	 * The type of Nitro subscription on the user's account
	 */
	public premiumType?: UserPremiumType;

	/**
	 * The timestamp when the user was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the user was created
	 */
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
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}

	/**
	 * Check if two users are equal
	 *
	 * @param user - The user to compare to the current user
	 * @returns true if they are equal, false otherwise
	 */
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
