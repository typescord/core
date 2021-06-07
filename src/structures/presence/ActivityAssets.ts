import { GatewayActivityAssets } from 'discord-api-types';
import { Activity } from './Activity';

/**
 * Structure representing the assets of an activity
 */
export class ActivityAssets {
	/**
	 * The id for a large asset of the activity
	 */
	public largeImage?: string;

	/**
	 * Text displayed when hovering over the large image of the activity
	 */
	public largeText?: string;

	/**
	 * The id for a small asset of the activity
	 */
	public smallImage?: string;

	/**
	 * Text displayed when hovering over the small image of the activity
	 */
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
