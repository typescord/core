import { APIChannel, Snowflake } from 'discord-api-types';
import { DMChannel } from './DMChannel';

export class GroupeDMChannel extends DMChannel {
	public icon?: string;
	public ownerId?: Snowflake;
	public applicationId?: Snowflake;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		if (data.icon) {
			this.icon = data.icon;
		}

		this.ownerId = data.owner_id;
		this.applicationId = data.application_id;
	}
}
