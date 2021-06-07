import { APIChannel } from 'discord-api-types';
import { GuildChannel } from '../GuildChannel';
import { TextBasedChannel } from './TextBasedChannel';

/**
 * Structure representing a guild text channel
 */
export class TextChannel extends TextBasedChannel(GuildChannel) {
	/**
	 * The topic of the channel
	 */
	public topic?: string;

	/**
	 * The amount of seconds a user has to wait before sending another message
	 */
	public rateLimitPerUser?: number;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.topic = data.topic ?? undefined;
		this.rateLimitPerUser = data.rate_limit_per_user;
	}
}
