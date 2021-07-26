import type { APIChannel } from 'discord-api-types/v8';
import type { Snowflake } from '../../..';
import { DMChannel } from './DMChannel';

export class GroupeDMChannel extends DMChannel {
	public icon?: string;
	public ownerId?: Snowflake;
	public applicationId?: Snowflake;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.icon = data.icon ?? undefined;
		this.ownerId = data.owner_id;
		this.applicationId = data.application_id;
	}
}
