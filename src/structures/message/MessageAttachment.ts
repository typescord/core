import { APIAttachment, Snowflake } from 'discord-api-types';

export class MessageAttachment {
	public id!: Snowflake;
	public filename!: string;
	public contentType?: string;
	public size!: number;
	public url!: string;
	public proxyUrl!: string;
	public height?: number;
	public width?: number;

	public constructor(data: APIAttachment) {
		this.$patch(data);
	}

	public $patch(data: APIAttachment): void {
		if (data.height) {
			this.height = data.height;
		}

		if (data.width) {
			this.width = data.width;
		}

		this.id = data.id;
		this.filename = data.filename;
		this.contentType = data.content_type;
		this.size = data.size;
		this.url = data.url;
		this.proxyUrl = data.proxy_url;
	}

	public get spoiler(): boolean {
		return this.url.startsWith('SPOILER_');
	}
}
