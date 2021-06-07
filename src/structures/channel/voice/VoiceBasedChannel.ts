import { APIChannel, VideoQualityMode } from 'discord-api-types';
import { GuildChannel } from '../GuildChannel';

export class VoiceBasedChannel extends GuildChannel {
	/**
	 * The bitrate of the voice channel
	 */
	public bitrate?: number;

	/**
	 * The user limit of the voice channel
	 */
	public userLimit?: number;

	/**
	 * Voice region id of the voice channel
	 */
	public rtcRegion?: string;

	/**
	 * The camera video quality mode of the voice channel
	 */
	public videoQualityMode?: VideoQualityMode;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.bitrate = data.bitrate;
		this.userLimit = data.user_limit;
		this.rtcRegion = data.rtc_region ?? undefined;
		this.videoQualityMode = data.video_quality_mode;
	}
}
