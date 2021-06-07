import { APIChannel, Snowflake } from 'discord-api-types';
import { DMChannel } from './DMChannel';

/**
 * Structure representing a group DM channel
 */
export class GroupeDMChannel extends DMChannel {
	/**
	 * The icon of the channel
	 */
	public icon?: string;

	/**
	 * The id of the group's owner
	 */
	public ownerId?: Snowflake;

	/**
	 * The application's id of the bot if it's the owner of the group
	 */
	public applicationId?: Snowflake;

	public $patch(data: APIChannel): void {
		super.$patch(data);

		this.icon = data.icon ?? undefined;
		this.ownerId = data.owner_id;
		this.applicationId = data.application_id;
	}
}
