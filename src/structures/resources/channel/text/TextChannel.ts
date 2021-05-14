import { APIChannel } from 'discord-api-types';
import { GuildChannel } from '../GuildChannel';
import { TextBasedChannel } from './TextBasedChannel';

export class TextChannel extends TextBasedChannel(GuildChannel) {
	public topic?: string;
	public rateLimitPerUser?: number;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.topic = data.topic ?? undefined;
		this.rateLimitPerUser = data.rate_limit_per_user;
	}
}
