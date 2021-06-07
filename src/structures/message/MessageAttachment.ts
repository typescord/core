import { APIAttachment, Snowflake } from 'discord-api-types';

/**
 * Structure representing a message attachment
 */
export class MessageAttachment {
	/**
	 * The id of the attachment
	 */
	public id!: Snowflake;

	/**
	 * The name of the attached file
	 */
	public filename!: string;

	/**
	 * The media type of the attachment
	 */
	public contentType?: string;

	/**
	 * The size of the attached file in bytes
	 */
	public size!: number;

	/**
	 * The source url of the attached file
	 */
	public url!: string;

	/**
	 * Whether the attachment is hidden by a spoiler tag
	 */
	public spoiler!: boolean;

	/**
	 * A proxied url of the attached file
	 */
	public proxyUrl!: string;

	/**
	 * The height of the attached file if it's an image
	 */
	public height?: number;

	/**
	 * The width of the attached file if it's an image
	 */
	public width?: number;

	public constructor(data: APIAttachment) {
		this.$patch(data);
	}

	public $patch(data: APIAttachment): void {
		this.id = data.id;
		this.filename = data.filename;
		this.contentType = data.content_type;
		this.size = data.size;
		this.url = data.url;
		this.spoiler = this.url.startsWith('SPOILER_');
		this.proxyUrl = data.proxy_url;
		this.height = data.height ?? undefined;
		this.width = data.width ?? undefined;
	}
}
