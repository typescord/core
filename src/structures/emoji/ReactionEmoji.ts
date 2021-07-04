import type { APIPartialEmoji } from 'discord-api-types/v8';
import type { MessageReaction } from '../message/MessageReaction';
import { Emoji } from './Emoji';

export class ReactionEmoji extends Emoji {
	public constructor(public readonly reaction: MessageReaction, data: APIPartialEmoji) {
		super(reaction.message.client, data);
	}
}
