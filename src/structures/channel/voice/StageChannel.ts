import type { APIChannel } from 'discord-api-types/v8';
import { VoiceBasedChannel } from './VoiceBasedChannel';

export class StageChannel extends VoiceBasedChannel {
	public topic?: string;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.topic = data.topic ?? undefined;
	}
}
