import type { APIPartialEmoji } from 'discord-api-types';
import type { Client, Snowflake } from '../..';
import { getTimestamp } from '../../utils/snowflake';

export class Emoji {
	public id?: Snowflake;
	public name?: string;
	public animated?: boolean;
	public createdTimestamp?: number;
	public createdAt?: Date;
	public identifier?: string;

	public constructor(public readonly client: Client, data: APIPartialEmoji) {
		this.$patch(data);
	}

	public $patch(data: APIPartialEmoji): void {
		this.id = data.id ?? undefined;
		this.name = data.name ?? undefined;
		this.animated = data.animated;
		this.createdTimestamp = this.id && getTimestamp(this.id);
		this.createdAt = this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
		this.identifier = this.toString();
	}

	public toString(): string | undefined {
		return this.id ? `${this.animated ? 'a:' : ''}${this.name}:${this.id}` : this.name;
	}
}
