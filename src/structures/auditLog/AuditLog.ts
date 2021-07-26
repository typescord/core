import Collection from '@discordjs/collection';
import type { APIAuditLog } from 'discord-api-types/v8';
import type { Snowflake } from '../..';
import { Guild } from '../guild/Guild';
import { GuildIntegration } from '../guild/GuildIntegration';
import { User } from '../User';
import { Webhook } from '../Webhook';
import { AuditLogEntry } from './AuditLogEntry';

export class AuditLog {
	public webhooks = new Collection<Snowflake, Webhook>();
	public users = new Collection<Snowflake, User>();
	public auditLogEntries = new Collection<Snowflake, AuditLogEntry>();
	public integrations = new Collection<Snowflake, GuildIntegration>();

	public constructor(public readonly guild: Guild, data: APIAuditLog) {
		this.$patch(data);
	}

	public $patch(data: APIAuditLog): void {
		for (const webhook of data.webhooks) {
			this.webhooks.set(webhook.id, new Webhook(this.guild.client, webhook));
		}

		for (const user of data.users) {
			this.users.set(user.id, new User(this.guild.client, user));
		}

		for (const auditLogEntry of data.audit_log_entries) {
			this.auditLogEntries.set(auditLogEntry.id, new AuditLogEntry(this, auditLogEntry));
		}

		for (const integration of data.integrations) {
			this.integrations.set(integration.id, new GuildIntegration(this.guild, integration));
		}
	}
}
