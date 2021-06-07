import { APIAuditLogChange, APIAuditLogEntry, AuditLogEvent, AuditLogOptionsType, Snowflake } from 'discord-api-types';
import { deconstruct } from '../../utils/Snowflake';
import { AuditLog } from './AuditLog';

interface AuditLogOptions {
	/**
	 * The number of days after which inactive members were kicked with a prune
	 */
	deleteMemberDays?: string;

	/**
	 * The number of members removed by a prune
	 */
	membersRemoved?: string;

	/**
	 * The channel in which the entities were targeted
	 */
	channelId?: Snowflake;

	/**
	 * The id of the message that was targeted
	 */
	messageId?: Snowflake;

	/**
	 * The number of entities that were targeted
	 */
	count?: string;

	/**
	 * The id of an overwritten entity
	 */
	id?: Snowflake;

	/**
	 * The type of overwritten entity
	 */
	type?: AuditLogOptionsType;

	/**
	 * The name of a targeted role
	 */
	roleName?: string;
}

interface AuditLogChange<K extends string, V extends unknown> {
	/**
	 * The name of audit log change key
	 */
	key: K;

	/**
	 * The new value of the key
	 */
	newValue?: V;

	/**
	 * The old value of the key
	 */
	oldValue?: V;
}

/**
 * Structure representing an audit log entry
 */
export class AuditLogEntry {
	/**
	 * The id of the entry
	 */
	public id!: Snowflake;

	/**
	 * The id of the affected entity (webhook, user, role, etc.)
	 */
	public targetId?: string;

	/**
	 * The changes made to the target
	 */
	public changes?: AuditLogChange<APIAuditLogChange['key'], APIAuditLogChange['old_value']>[];

	/**
	 * The id of the user who made the changes
	 */
	public userId?: Snowflake;

	/**
	 * Type of action that occurred
	 */
	public actionType!: AuditLogEvent;

	/**
	 * Additional info for certain action types
	 */
	public options?: AuditLogOptions;

	/**
	 * The reason for the change
	 */
	public reason?: string;

	/**
	 * The timestamp when this entry was created
	 */
	public createdTimestamp!: number;

	/**
	 * The date when this entry was created
	 */
	public createdAt!: Date;

	public constructor(public readonly logs: AuditLog, data: APIAuditLogEntry) {
		this.$patch(data);
	}

	public $patch(data: APIAuditLogEntry): void {
		this.id = data.id;
		this.targetId = data.target_id ?? undefined;
		this.changes = data.changes?.map((change) => ({
			key: change.key,
			newValue: change.new_value,
			oldValue: change.old_value,
		}));
		this.userId = data.user_id ?? undefined;
		this.actionType = data.action_type;
		this.options = data.options;
		this.reason = data.reason;
		this.createdTimestamp = deconstruct(this.id)!.timestamp;
		this.createdAt = new Date(this.createdTimestamp);
	}
}
