import { APISticker, Snowflake, StickerFormatType } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

/**
 * Structure representing a message sticker
 */
export class Sticker {
	/**
	 * The id of the sticker
	 */
	public id!: Snowflake;

	/**
	 * The id of the pack the sticker is from
	 */
	public packId!: Snowflake;

	/**
	 * The name of the sticker
	 */
	public name!: string;

	/**
	 * The description of the sticker
	 */
	public description!: string;

	/**
	 * The tags of the sticker
	 */
	public tags?: string[];

	/**
	 * The asset hash of the sticker
	 */
	public asset!: string;

	/**
	 * The type of sticker format
	 */
	public formatType!: StickerFormatType;

	/**
	 * The timestamp when the sticker was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the sticker was created
	 */
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
