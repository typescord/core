import type { APIReaction } from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { Message } from './Message';

export class MessageReaction {
	public count!: number;
	public me!: boolean;
	public emoji!: Emoji;

	public constructor(public readonly message: Message, data: APIReaction) {
		this.$patch(data);
	}

	public $patch(data: APIReaction): void {
		this.count = data.count;
		this.me = data.me;
		this.emoji = new Emoji(this.message.client, data.emoji);
	}
}
