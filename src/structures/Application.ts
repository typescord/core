import { APIApplication, ApplicationFlags, Snowflake } from 'discord-api-types';
import { Client } from '../clients';
import { deconstruct } from '../utils/Snowflake';
import { Team } from './team/Team';
import { User } from './User';

/**
 * Structure representing an application
 */
export class Application {
	/**
	 * The id of the application
	 */
	public id!: Snowflake;

	/**
	 * The name of the application
	 */
	public name?: string;

	/**
	 * The icon hash of the application
	 */
	public icon?: string;

	/**
	 * The description of the application
	 */
	public description?: string;

	/**
	 * An array of rpc origin urls if rpc is enabled
	 */
	public rpcOrigins?: string[];

	/**
	 * Whether or not the application is public (so everyone can join the application's bot to their guilds)
	 */
	public botPublic?: boolean;

	/**
	 * Whether or not the application's bot needs completion of the full oauth2 code grant flow to join guilds
	 */
	public botRequireCodeGrant?: boolean;

	/**
	 * The url of the application's terms of service
	 */
	public termsOfServiceUrl?: string;

	/**
	 * The url of the application's privacy policy
	 */
	public privacyPolicyUrl?: string;

	/**
	 * The owner of the application
	 */
	public owner?: User;

	/**
	 * If this application is a game sold on Discord, this field will be the summary field for the store page of its primary sku
	 */
	public summary?: string;

	/**
	 * The hex encoded key for verification in interactions
	 */
	public verifyKey?: string;

	/**
	 * The team of the application if it belongs to one
	 */
	public team?: Team;

	/**
	 * If this application is a game sold on Discord, this field will be the guild to which it has been linked
	 */
	public guildId?: Snowflake;

	/**
	 * If this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists
	 */
	public primarySkuId?: Snowflake;

	/**
	 * If this application is a game sold on Discord, this field will be the URL slug that links to the store page
	 */
	public slug?: string;

	/**
	 * The default rich presence invite cover image hash of the application
	 */
	public coverImage?: string;

	/**
	 * The public flags of the application
	 */
	public flags?: ApplicationFlags;

	/**
	 * The timestamp when the application was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the application was created
	 */
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: Partial<APIApplication>) {
		this.$patch(data);
	}

	public $patch(data: Partial<APIApplication>): void {
		this.id = data.id!;
		this.name = data.name;
		this.icon = data.icon ?? undefined;
		this.description = data.description;
		this.rpcOrigins = data.rpc_origins;
		this.botPublic = data.bot_public;
		this.botRequireCodeGrant = data.bot_require_code_grant;
		this.termsOfServiceUrl = data.terms_of_service_url;
		this.privacyPolicyUrl = data.privacy_policy_url;
		this.owner = data.owner && new User(this.client, data.owner);
		this.summary = data.summary;
		this.verifyKey = data.verify_key;
		this.team = data.team ? new Team(this.client, data.team) : undefined;
		this.guildId = data.guild_id;
		this.primarySkuId = data.primary_sku_id;
		this.slug = data.slug;
		this.coverImage = data.cover_image;
		this.flags = data.flags;
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}

	public toString(): string | undefined {
		return this.name;
	}
}
