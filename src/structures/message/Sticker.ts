import { APISticker, Snowflake, StickerFormatType } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

export class Sticker {
	public id!: Snowflake;
	public packId!: Snowflake;
	public name!: string;
	public description!: string;
	public tags?: string[];
	public asset!: string;
	public formatType!: StickerFormatType;
	public createdTimestamp!: number;
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APISticker) {
		this.$patch(data);
	}

	public $patch(data: APISticker): void {
		this.id = data.id;
		this.packId = data.pack_id;
		this.name = data.name;
		this.description = data.description;
		this.tags = data.tags?.split(', ');
		this.asset = data.asset;
		this.formatType = data.format_type;
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}
}
