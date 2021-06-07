import { APIChannel, ChannelType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

/**
 * Structure representing any kind of channel
 */
export class Channel {
	/**
	 * The id of the channel
	 */
	public id!: Snowflake;

	/**
	 * The type of the channel
	 */
	public type!: ChannelType;

	/**
	 * The timestamp when the channel was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when the channel was created
	 */
	public createdAt!: Date;

	public constructor(public readonly client: Client, data: APIChannel) {
		this.$patch(data);
	}

	public $patch(data: APIChannel): void {
		this.id = data.id;
		this.type = data.type;
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}

	public toString(): string {
		return `<#${this.id}>`;
	}
}
