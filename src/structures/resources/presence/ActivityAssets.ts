import { GatewayActivityAssets } from 'discord-api-types';
import { Activity } from './Activity';

export class ActivityAssets {
	public largeImage?: string;
	public largeText?: string;
	public smallImage?: string;
	public smallText?: string;

	public constructor(public readonly activity: Activity, data: GatewayActivityAssets) {
		this.$patch(data);
	}

	public $patch(data: GatewayActivityAssets): void {
		this.largeImage = data.large_image;
		this.largeText = data.large_text;
		this.smallImage = data.small_image;
		this.smallText = data.small_text;
	}
}
