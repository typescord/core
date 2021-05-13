import { APIChannel, ChannelType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

export class Channel {
	public id!: Snowflake;
	public type!: ChannelType;
	public createdTimestamp!: number;
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
