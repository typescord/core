import { TextChannel } from './TextChannel';

export class NewsChannel extends TextChannel {
	public $patch(): void {
		this.rateLimitPerUser = undefined;
	}
}
