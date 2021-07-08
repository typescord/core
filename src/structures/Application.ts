import type { APIApplication, ApplicationFlags } from 'discord-api-types/v8';
import { Client, Snowflake } from '..';
import { getTimestamp } from '../utils/snowflake';
import { Team } from './team/Team';
import { User } from './User';

export class Application {
	public id!: Snowflake;
	public name?: string;
	public icon?: string;
	public description?: string;
	public rpcOrigins?: string[];
	public botPublic?: boolean;
	public botRequireCodeGrant?: boolean;
	public termsOfServiceUrl?: string;
	public privacyPolicyUrl?: string;
	public owner?: User;
	public summary?: string;
	public verifyKey?: string;
	public team?: Team;
	public guildId?: Snowflake;
	public primarySkuId?: Snowflake;
	public slug?: string;
	public coverImage?: string;
	public flags?: ApplicationFlags;
	public createdTimestamp?: number;
	public createdAt?: Date;

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
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);
	}

	public toString(): string | undefined {
		return this.name;
	}
}
