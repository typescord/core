import { APIChannel, VideoQualityMode } from 'discord-api-types';
import { GuildChannel } from '../GuildChannel';

export class VoiceBasedChannel extends GuildChannel {
	public bitrate?: number;
	public userLimit?: number;
	public rtcRegion?: string;
	public videoQualityMode?: VideoQualityMode;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		if (data.rtc_region) {
			this.rtcRegion = data.rtc_region;
		}

		this.bitrate = data.bitrate;
		this.userLimit = data.user_limit;
		this.videoQualityMode = data.video_quality_mode;
	}
}
