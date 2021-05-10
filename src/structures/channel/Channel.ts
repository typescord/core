import { APIChannel, ChannelType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';

export class Channel {
	public id!: Snowflake;
	public type!: ChannelType;

	public constructor(public readonly client: Client, data: APIChannel) {
		this.$patch(data);
	}

	public $patch(data: APIChannel): void {
		this.id = data.id;
		this.type = data.type;
	}

	public isText(): boolean {
		return 'messages' in this;
	}

	public toString(): string {
		return `<#${this.id}>`;
	}
}
