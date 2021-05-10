import Collection from '@discordjs/collection';
import { APIChannel, Snowflake } from 'discord-api-types';
import { Channel } from '../Channel';
import { Message } from '../../message/Message';

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T = {}> = new (...args: any[]) => T;

export function TextBasedChannel<T extends Constructor<Channel>>(BaseClass: T) {
	return class extends BaseClass {
		public messages = new Collection<Snowflake, Message>();
		public lastMessageId?: Snowflake;
		public lastPinTimestamp?: number;

		public $patch(data: APIChannel): void {
			super.$patch(data);

			if (data.last_message_id) {
				this.lastMessageId = data.last_message_id;
			}
		}

		public get lastMessage(): Message | undefined {
			return this.lastMessageId ? this.messages.get(this.lastMessageId) : undefined;
		}

		public get lastPinAt() {
			return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : undefined;
		}
	};
}
