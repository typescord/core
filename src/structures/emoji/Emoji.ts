import { APIPartialEmoji, Snowflake } from 'discord-api-types';
import { Client } from '../../clients';

export class Emoji {
	public id?: Snowflake;
	public name?: string;
	public animated!: boolean;

	public constructor(public readonly client: Client, data: APIPartialEmoji) {
		this.$patch(data);
	}

	public $patch(data: APIPartialEmoji): void {
		if (data.id) {
			this.id = data.id;
		}

		if (data.name) {
			this.name = data.name;
		}

		this.animated = !!data.animated;
	}

	public get identifier(): string | undefined {
		const temporaryIdentifier = this.toString();

		if (this.id) {
			return temporaryIdentifier;
		} else if (temporaryIdentifier) {
			return encodeURIComponent(temporaryIdentifier);
		}
	}

	public toString(): string | undefined {
		return this.id ? `${this.animated ? 'a:' : ''}${this.name}:${this.id}` : this.name;
	}
}
