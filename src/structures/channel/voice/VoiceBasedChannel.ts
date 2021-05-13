import { APIChannel, VideoQualityMode } from 'discord-api-types';
import { GuildChannel } from '../GuildChannel';

export class VoiceBasedChannel extends GuildChannel {
	public bitrate?: number;
	public userLimit?: number;
	public rtcRegion?: string;
	public videoQualityMode?: VideoQualityMode;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.bitrate = data.bitrate;
		this.userLimit = data.user_limit;
		this.rtcRegion = data.rtc_region ?? undefined;
		this.videoQualityMode = data.video_quality_mode;
	}
}
