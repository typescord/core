import Collection from '@discordjs/collection';
import type { APIChannel } from 'discord-api-types/v8';
import type { Snowflake } from '../../..';
import { Channel } from '../Channel';
import { User } from '../../User';
import { TextBasedChannel } from './TextBasedChannel';

export class DMChannel extends TextBasedChannel(Channel) {
	public topic?: string;
	public recipients = new Collection<Snowflake, User>();

	public $patch(data: APIChannel): void {
		if (data.recipients) {
			for (const recipient of data.recipients) {
				this.recipients.set(recipient.id, new User(this.client, recipient));
			}
		}
	}
}
