import { APIWebhook, Snowflake, WebhookType } from 'discord-api-types';
import { Client } from '../clients';
import { TextChannel } from './channel/text/TextChannel';
import { Guild } from './guild/Guild';
import { User } from './User';

export class Webhook {
	public id!: Snowflake;
	public type!: WebhookType;
	public guildId?: Snowflake;
	public channelId!: Snowflake;
	public user?: User;
	public name?: string;
	public avatar?: string;
	public token?: string;
	public applicationId?: Snowflake;
	public sourceGuild?: Guild;
	public sourceChannel?: TextChannel;
	public url?: string;

	public constructor(public readonly client: Client, data: APIWebhook) {
		this.$patch(data);
	}

	public $patch(data: APIWebhook): void {
		if (data.user) {
			this.user = new User(this.client, data.user);
		}

		if (data.name) {
			this.name = data.name;
		}

		if (data.avatar) {
			this.avatar = data.avatar;
		}

		if (data.application_id) {
			this.applicationId = data.application_id;
		}

		if (data.source_guild) {
			this.sourceGuild = new Guild(this.client, data.source_guild);

			if (data.source_channel) {
				this.sourceChannel = new TextChannel(this.sourceGuild, data.source_channel);
			}
		}

		this.id = data.id;
		this.type = data.type;
		this.guildId = data.guild_id;
		this.channelId = data.channel_id;
		this.token = data.token;
		this.url = data.url;
	}
}
