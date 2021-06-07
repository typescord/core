import { TextChannel } from './TextChannel';

/**
 * Structure representing a news channel
 */
export class NewsChannel extends TextChannel {
	public $patch(): void {
		this.rateLimitPerUser = undefined;
	}
}
