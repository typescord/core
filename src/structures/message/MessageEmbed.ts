import { APIEmbed, EmbedType } from 'discord-api-types';

interface EmbedThumbnail {
	url?: string;
	proxyUrl?: string;
	height?: number;
	width?: number;
}

interface EmbedVideo {
	url?: string;
	height?: number;
	width?: number;
}

interface EmbedImage {
	url?: string;
	proxyUrl?: string;
	height?: number;
	width?: number;
}

interface EmbedProvider {
	name?: string;
	url?: string;
}

interface EmbedAuthor {
	name?: string;
	url?: string;
	iconUrl?: string;
	proxyIconUrl?: string;
}

interface EmbedFooter {
	text: string;
	iconUrl?: string;
	proxyIconUrl?: string;
}

interface EmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

export class Embed {
	public title?: string;
	public type?: EmbedType;
	public description?: string;
	public url?: string;
	public createdTimestamp?: string;
	public color?: number;
	public footer?: EmbedFooter;
	public image?: EmbedImage;
	public thumbnail?: EmbedThumbnail;
	public video?: EmbedVideo;
	public provider?: EmbedProvider;
	public author?: EmbedAuthor;
	public fields?: EmbedField[];

	public constructor(data: APIEmbed) {
		this.$patch(data);
	}

	public $patch(data: APIEmbed): void {
		if (data.footer) {
			this.footer = {
				text: data.footer.text,
				iconUrl: data.footer.icon_url,
				proxyIconUrl: data.footer.proxy_icon_url,
			};
		}

		if (data.image) {
			this.image = {
				url: data.image.url,
				proxyUrl: data.image.proxy_url,
				height: data.image.height,
				width: data.image.width,
			};
		}

		if (data.thumbnail) {
			this.thumbnail = {
				url: data.thumbnail.url,
				proxyUrl: data.thumbnail.proxy_url,
				height: data.thumbnail.height,
				width: data.thumbnail.width,
			};
		}

		if (data.author) {
			this.author = {
				name: data.author.name,
				url: data.author.url,
				iconUrl: data.author.icon_url,
				proxyIconUrl: data.author.proxy_icon_url,
			};
		}

		this.title = data.title;
		this.type = data.type;
		this.description = data.description;
		this.url = data.url;
		this.createdTimestamp = data.timestamp;
		this.color = data.color;
		this.video = data.video;
		this.provider = data.provider;
		this.fields = data.fields;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public get hexColor(): string | undefined {
		return this.color ? `#${this.color.toString(16).padStart(6, '0')}` : undefined;
	}
}
