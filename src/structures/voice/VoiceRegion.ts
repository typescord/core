import type { APIVoiceRegion } from 'discord-api-types/v8';

export class VoiceRegion {
	public id!: string;
	public name!: string;
	public vip!: boolean;
	public optimal!: boolean;
	public deprecated!: boolean;
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
