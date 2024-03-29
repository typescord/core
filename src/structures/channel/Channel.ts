import type { APIChannel, ChannelType } from 'discord-api-types/v8';
import { Client, Snowflake } from '../..';
import { getTimestamp } from '../../utils/snowflake';

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
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);
	}

	public toString(): string {
		return `<#${this.id}>`;
	}
}
