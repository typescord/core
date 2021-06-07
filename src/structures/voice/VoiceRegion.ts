import { APIVoiceRegion } from 'discord-api-types';

/**
 * Structure representing a user's voice connection region
 */
export class VoiceRegion {
	/**
	 * The id of the region
	 */
	public id!: string;

	/**
	 * The name of the region
	 */
	public name!: string;

	/**
	 * Whether or not this is a is a vip-only server
	 */
	public vip!: boolean;

	/**
	 * True for a single server that is closest to the current user's client
	 */
	public optimal!: boolean;

	/**
	 * Whether or not this voice region is deprecated
	 */
	public deprecated!: boolean;

	/**
	 * Whether or not this is a custom voice region
	 */
	public custom!: boolean;

	public constructor(data: APIVoiceRegion) {
		this.$patch(data);
	}

	public $patch(data: APIVoiceRegion): void {
		this.id = data.id;
		this.name = data.name;
		this.vip = data.vip;
		this.optimal = data.optimal;
		this.deprecated = data.deprecated;
		this.custom = data.custom;
	}
}
