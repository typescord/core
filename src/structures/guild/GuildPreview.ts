import { APIGuildPreview, GuildFeature, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { GuildPreviewEmoji } from '../emoji/GuildPreviewEmoji';

/**
 * Structure representing a guild preview
 */
export class GuildPreview {
	/**
	 * The id of the guild
	 */
	public id!: Snowflake;

	/**
	 * The name of the guild
	 */
	public name!: string;

	/**
	 * The icon hash of the guild
	 */
	public icon?: string;

	/**
	 * The splash hash of the guild
	 */
	public splash?: string;

	/**
	 * The discovery splash hash of the guild
	 */
	public discoverySplash?: string;

	/**
	 * The custom emojis of the guild
	 */
	public emojis!: GuildPreviewEmoji[];

	/**
	 * The enabled features of the guild
	 */
	public features!: GuildFeature[];

	/**
	 * The approximate number of members in the guild
	 */
	public approximateMemberCount!: number;

	/**
	 * The approximate number of online members in the guild
	 */
	public approximatePresenceCount!: number;

	/**
	 * The guild description if the guild is discoverable
	 */
	public description!: string;

	public constructor(public readonly client: Client, data: APIGuildPreview) {
		this.$patch(data);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public $patch(data: APIGuildPreview): void {
		this.id = data.id;
		this.name = data.name;
		this.icon = data.icon ?? undefined;
		this.splash = data.splash ?? undefined;
		this.discoverySplash = data.discovery_splash ?? undefined;
		this.emojis = data.emojis.map((emoji) => new GuildPreviewEmoji(this, emoji));
		this.features = data.features;
		this.approximateMemberCount = data.approximate_member_count;
		this.approximatePresenceCount = data.approximate_presence_count;
		this.description = data.description;
	}

	public toString(): string {
		return this.name;
	}
}
