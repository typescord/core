import Collection from '@discordjs/collection';
import { APIAuditLog, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { GuildIntegration } from '../guild/GuildIntegration';
import { User } from '../User';
import { Webhook } from '../Webhook';
import { AuditLogEntry } from './AuditLogEntry';

/**
 * Contains audit log of guilds
 */
export class AuditLog {
	/**
	 * Webhooks found in this audit log
	 */
	public webhooks = new Collection<Snowflake, Webhook>();

	/**
	 * Users found in this audit log
	 */
	public users = new Collection<Snowflake, User>();

	/**
	 * The entries of the audit log
	 */
	public auditLogEntries = new Collection<Snowflake, AuditLogEntry>();

	/**
	 * Integrations found in this audit log
	 */
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
