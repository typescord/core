import { APIGuildPreview, GuildFeature, Snowflake } from 'discord-api-types';
import { Client } from '../../../clients';
import { GuildPreviewEmoji } from '../emoji/GuildPreviewEmoji';

export class GuildPreview {
	public id!: Snowflake;
	public name!: string;
	public icon?: string;
	public splash?: string;
	public discoverySplash?: string;
	public emojis!: GuildPreviewEmoji[];
	public features!: GuildFeature[];
	public approximateMemberCount!: number;
	public approximatePresenceCount!: number;
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
