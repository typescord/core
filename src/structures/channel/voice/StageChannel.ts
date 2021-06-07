import { APIChannel } from 'discord-api-types';
import { VoiceBasedChannel } from './VoiceBasedChannel';

/**
 * Structure representig a guild stage channel
 */
export class StageChannel extends VoiceBasedChannel {
	/**
	 * The topic of the channel
	 */
	public topic?: string;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.topic = data.topic ?? undefined;
	}
}
