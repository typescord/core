import { APIApplication, ApplicationFlags, Snowflake } from 'discord-api-types';
import { Client } from '../clients';
import { deconstruct } from '../utils/Snowflake';
import { Team } from './team/Team';
import { User } from './User';

export class Application {
	public id?: Snowflake;
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

	public constructor(public readonly client: Client, data: Partial<APIApplication>) {
		this.$patch(data);
	}

	public $patch(data: Partial<APIApplication>): void {
		if (data.icon) {
			this.icon = data.icon;
		}

		if (data.team) {
			this.team = new Team(this.client, data.team);
		}

		if (data.owner) {
			this.owner = new User(this.client, data.owner);
		}

		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.rpcOrigins = data.rpc_origins;
		this.botPublic = data.bot_public;
		this.botRequireCodeGrant = data.bot_require_code_grant;
		this.termsOfServiceUrl = data.terms_of_service_url;
		this.privacyPolicyUrl = data.privacy_policy_url;
		this.summary = data.summary;
		this.verifyKey = data.verify_key;
		this.guildId = data.guild_id;
		this.primarySkuId = data.primary_sku_id;
		this.slug = data.slug;
		this.coverImage = data.cover_image;
		this.flags = data.flags;
	}

	public get createdTimestamp(): number | undefined {
		return this.id ? deconstruct(this.id)?.timestamp : undefined;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public toString(): string | undefined {
		return this.name;
	}
}
