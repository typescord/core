import Collection from '@discordjs/collection';
import { APIChannel, Snowflake } from 'discord-api-types';
import { Channel } from '../Channel';
import { Message } from '../../message/Message';

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T = {}> = new (...args: any[]) => T;

export function TextBasedChannel<T extends Constructor<Channel>>(BaseClass: T) {
	return class extends BaseClass {
		/**
		 * The messages sent in the channel
		 */
		public messages = new Collection<Snowflake, Message>();

		/**
		 * The id of the last message sent in the channel
		 */
		public lastMessageId?: Snowflake;

		/**
		 * The timestamp when the last pinned message was pinned
		 */
		public lastPinTimestamp?: number;

		/**
		 * The date when the last pinned message was pinned
		 */
		public lastPinAt?: Date;

		public $patch(data: APIChannel): void {
			super.$patch(data);

			this.lastMessageId = data.last_message_id ?? undefined;
			this.lastPinTimestamp = data.last_pin_timestamp ? Number(data.last_pin_timestamp) : undefined;
			this.lastPinAt = this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : undefined;
		}

		/**
		 * The last message sent in the channel
		 */
		public get lastMessage(): Message | undefined {
			return this.lastMessageId && this.messages.get(this.lastMessageId);
		}
	};
}
