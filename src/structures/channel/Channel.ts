import { APIChannel, ChannelType, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

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

	public get createdTimestamp(): number | undefined {
		return deconstruct(this.id)?.timestamp;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}

	public isText(): boolean {
		return 'messages' in this;
	}

	public toString(): string {
		return `<#${this.id}>`;
	}
}
