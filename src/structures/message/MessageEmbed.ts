import { APIEmbed, EmbedType } from 'discord-api-types';

interface EmbedThumbnail {
	/**
	 * The source url of the thumbnail
	 */
	url?: string;

	/**
	 * A proxied url of the thumbnail
	 */
	proxyUrl?: string;

	/**
	 * The height of the thumbnail
	 */
	height?: number;

	/**
	 * The width of the thumbnail
	 */
	width?: number;
}

interface EmbedVideo {
	/**
	 * The source url of the video
	 */
	url?: string;

	/**
	 * The height of the video
	 */
	height?: number;

	/**
	 * The width of the video
	 */
	width?: number;
}

interface EmbedImage {
	/**
	 * The source url of the image
	 */
	url?: string;

	/**
	 * A proxied url of the image
	 */
	proxyUrl?: string;

	/**
	 * The height of the image
	 */
	height?: number;

	/**
	 * The width of the image
	 */
	width?: number;
}

interface EmbedProvider {
	/**
	 * The name of the provider
	 */
	name?: string;

	/**
	 * The url of the provider
	 */
	url?: string;
}

interface EmbedAuthor {
	/**
	 * The name of the author
	 */
	name?: string;

	/**
	 * The url of the author
	 */
	url?: string;

	/**
	 * The url of the author's icon
	 */
	iconUrl?: string;

	/**
	 * A proxied url of the author's icon
	 */
	proxyIconUrl?: string;
}

interface EmbedFooter {
	/**
	 * The text of the footer
	 */
	text: string;

	/**
	 * The url of the footer's icon
	 */
	iconUrl?: string;

	/**
	 * A proxied url of the footer's icon
	 */
	proxyIconUrl?: string;
}

interface EmbedField {
	/**
	 * The name of the field
	 */
	name: string;

	/**
	 * The value of the field
	 */
	value: string;

	/**
	 * Whether or not this field should display inline
	 */
	inline?: boolean;
}

/**
 * Structure representing a message embed
 */
export class Embed {
	/**
	 * The title of the embed
	 */
	public title?: string;

	/**
	 * The type of embed
	 */
	public type?: EmbedType;

	/**
	 * The description of the embed
	 */
	public description?: string;

	/**
	 * The url of the embed
	 */
	public url?: string;

	/**
	 * The timestamp when the embed was created
	 */
	public createdTimestamp?: string;

	/**
	 * The date when the embed was created
	 */
	public createdAt?: Date;

	/**
	 * The decimal color code of the embed
	 */
	public color?: number;

	/**
	 * The footer's information of the embed
	 */
	public footer?: EmbedFooter;

	/**
	 * The image's information of the embed
	 */
	public image?: EmbedImage;

	/**
	 * The thumbnail's information of the embed
	 */
	public thumbnail?: EmbedThumbnail;

	/**
	 * The video's information of the embed
	 */
	public video?: EmbedVideo;

	/**
	 * The provider's information of the embed
	 */
	public provider?: EmbedProvider;

	/**
	 * The author's information of the embed
	 */
	public author?: EmbedAuthor;

	/**
	 * The fields' information of the embed
	 */
	public fields?: EmbedField[];

	public constructor(data: APIEmbed) {
		this.$patch(data);
	}

	public $patch(data: APIEmbed): void {
		this.title = data.title;
		this.type = data.type;
		this.description = data.description;
		this.url = data.url;
		this.createdTimestamp = data.timestamp;
		this.createdAt = this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
		this.color = data.color;
		this.footer = data.footer && {
			text: data.footer.text,
			iconUrl: data.footer.icon_url,
			proxyIconUrl: data.footer.proxy_icon_url,
		};
		this.image = data.image && {
			url: data.image.url,
			proxyUrl: data.image.proxy_url,
			height: data.image.height,
			width: data.image.width,
		};
		this.thumbnail = data.thumbnail && {
			url: data.thumbnail.url,
			proxyUrl: data.thumbnail.proxy_url,
			height: data.thumbnail.height,
			width: data.thumbnail.width,
		};
		this.video = data.video;
		this.provider = data.provider;
		this.author = data.author && {
			name: data.author.name,
			url: data.author.url,
			iconUrl: data.author.icon_url,
			proxyIconUrl: data.author.proxy_icon_url,
		};
		this.fields = data.fields;
	}

	/**
	 * The hexadecimal color code of the embed
	 */
	public get hexColor(): string | undefined {
		return this.color ? `#${this.color.toString(16).padStart(6, '0')}` : undefined;
	}
}
