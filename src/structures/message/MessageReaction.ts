import { APIReaction } from 'discord-api-types';
import { Emoji } from '../emoji/Emoji';
import { Message } from './Message';

/**
 * Structure representing a message reaction
 */
export class MessageReaction {
	/**
	 * Times the reaction's emoji has been used to react
	 */
	public count!: number;

	/**
	 * Whether the current user reacted using the reaction's emoji
	 */
	public me!: boolean;

	/**
	 * The emoji of the reaction
	 */
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
