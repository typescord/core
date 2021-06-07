import { APIPartialEmoji } from 'discord-api-types';
import { MessageReaction } from '../message/MessageReaction';
import { Emoji } from './Emoji';

/**
 * Structure representing a message reaction emoji
 */
export class ReactionEmoji extends Emoji {
	public constructor(public readonly reaction: MessageReaction, data: APIPartialEmoji) {
		super(reaction.message.client, data);
	}
}
