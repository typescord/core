import { APIChannel } from 'discord-api-types';
import { VoiceBasedChannel } from './VoiceBasedChannel';

export class StageChannel extends VoiceBasedChannel {
	public topic?: string;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.topic = data.topic ?? undefined;
	}
}
