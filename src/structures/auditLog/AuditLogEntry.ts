import { APIAuditLogChange, APIAuditLogEntry, AuditLogEvent, AuditLogOptionsType, Snowflake } from 'discord-api-types';
import { deconstruct } from '../../utils/Snowflake';
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

	public constructor(public readonly logs: AuditLog, data: APIAuditLogEntry) {
		this.$patch(data);
	}

	public $patch(data: APIAuditLogEntry): void {
		if (data.target_id) {
			this.targetId = data.target_id;
		}

		if (data.user_id) {
			this.userId = data.user_id;
		}

		this.id = data.id;
		this.changes = data.changes?.map((change) => ({
			key: change.key,
			newValue: change.new_value,
			oldValue: change.old_value,
		}));
		this.actionType = data.action_type;
		this.options = data.options;
		this.reason = data.reason;
	}

	public get createdTimestamp(): number | undefined {
		return deconstruct(this.id)?.timestamp;
	}

	public get createdAt(): Date | undefined {
		return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined;
	}
}
