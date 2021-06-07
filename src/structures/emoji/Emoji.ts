import { APIPartialEmoji, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';
import { deconstruct } from '../../utils/Snowflake';

/**
 * Structure representing an emoji
 */
export class Emoji {
	/**
	 * The id of the emoji
	 */
	public id?: Snowflake;

	/**
	 * The name of the emoji
	 */
	public name?: string;

	/**
	 * Whether this emoji is animated
	 */
	public animated?: boolean;

	/**
	 * The timestamp when the emoji was created
	 */
	public createdTimestamp?: number;

	/**
	 * The date when the emoji was created
	 */
	public createdAt?: Date;

	/**
	 * The identifier of the emoji
	 */
	public identifier?: string;

	public constructor(public readonly client: Client, data: APIPartialEmoji) {
		this.$patch(data);
	}

	public $patch(data: APIPartialEmoji): void {
		this.id = data.id ?? undefined;
		this.name = data.name ?? undefined;
		this.animated = data.animated;
		this.createdTimestamp = this.id ? deconstruct(this.id)?.timestamp : undefined;
		this.createdAt = this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
		this.identifier = this.toString();
	}

	public toString(): string | undefined {
		return this.id ? `${this.animated ? 'a:' : ''}${this.name}:${this.id}` : this.name;
	}
}
