import type { APIAuditLogChange, APIAuditLogEntry, AuditLogEvent, AuditLogOptionsType } from 'discord-api-types/v8';
import { Snowflake } from '../..';
import { getTimestamp } from '../../utils/snowflake';
import { AuditLog } from './AuditLog';

interface AuditLogOptions {
	deleteMemberDays?: string;
	membersRemoved?: string;
	channelId?: Snowflake;
	messageId?: Snowflake;
	count?: string;
	id?: Snowflake;
	type?: AuditLogOptionsType;
	roleName?: string;
}

interface AuditLogChange<K extends string, V extends unknown> {
	key: K;
	newValue?: V;
	oldValue?: V;
}

export class AuditLogEntry {
	public id!: Snowflake;
	public targetId?: string;
	public changes?: AuditLogChange<APIAuditLogChange['key'], APIAuditLogChange['old_value']>[];
	public userId?: Snowflake;
	public actionType!: AuditLogEvent;
	public options?: AuditLogOptions;
	public reason?: string;
	public createdTimestamp!: number;
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
		this.createdTimestamp = getTimestamp(this.id);
		this.createdAt = new Date(this.createdTimestamp);
	}
}
