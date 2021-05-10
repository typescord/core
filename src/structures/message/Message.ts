import {
	APIMessage,
	APIReaction,
	InteractionType,
	MessageActivityType,
	MessageFlags,
	MessageType,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../../clients';
import { Guild } from '../guild/Guild';
import { GuildChannel } from '../channel/GuildChannel';
import { GuildMember } from '../guild/GuildMember';
import { User } from '../User';
import { Application } from '../Application';
import { Embed } from './MessageEmbed';
import { Sticker } from './Sticker';
import { MessageAttachment } from './MessageAttachment';

interface MessageActivity {
	type: MessageActivityType;
	partyId?: string;
}

interface MessageReference {
	messageId?: Snowflake;
	channelId: Snowflake;
	guildId?: Snowflake;
}

interface MessageInteraction {
	id: Snowflake;
	type: InteractionType;
	name: string;
	user: User;
}

export class Message {
	public client: Client;
	public id!: Snowflake;
	public channelId!: Snowflake;
	public guildId?: Snowflake;
	public author!: User;
	public content!: string;
	public createdTimestamp!: string;
	public editedTimestamp?: string;
	public tts!: boolean;
	/* public mentionEveryone!: boolean;
	public mentions!: (User & {
		member?: Omit<GuildMember, 'user'>;
	})[];
	public mentionRoles!: Snowflake[];
	public mentionChannels?: APIChannelMention[];*/
	public attachments!: MessageAttachment[];
	public embeds!: Embed[];
	public reactions?: APIReaction[];
	public nonce?: string | number;
	public pinned!: boolean;
	public webhookId?: Snowflake;
	public type!: MessageType;
	public activity?: MessageActivity;
	public application?: Partial<Application>;
	public messageReference?: MessageReference;
	public flags?: MessageFlags;
	public stickers?: Sticker[];
	public referencedMessage?: Message;
	public interaction?: MessageInteraction;

	public constructor(public readonly channel: GuildChannel, data: APIMessage) {
		this.client = channel.client;

		this.$patch(data);
	}

	public $patch(data: APIMessage): void {
		if (data.edited_timestamp) {
			this.editedTimestamp = data.edited_timestamp;
		}

		if (data.referenced_message) {
			this.referencedMessage = new Message(this.channel, data.referenced_message);
		}

		if (data.application) {
			this.application = new Application(this.client, data.application);
		}

		if (data.message_reference) {
			this.messageReference = {
				messageId: data.message_reference.message_id,
				channelId: data.message_reference.channel_id,
				guildId: data.message_reference.guild_id,
			};
		}

		if (data.activity) {
			this.activity = {
				type: data.activity.type,
				partyId: data.activity.party_id,
			};
		}

		if (data.interaction) {
			this.interaction = {
				...data.interaction,
				user: new User(this.client, data.interaction.user),
			};
		}

		this.id = data.id;
		this.channelId = data.channel_id;
		this.guildId = data.guild_id;
		this.author = new User(this.client, data.author);
		this.content = data.content;
		this.createdTimestamp = data.timestamp;
		this.tts = data.tts;
		/*this.mentionEveryone = data.mention_everyone;
		this.mentions = data.mentions;
		this.mentionRoles = data.mention_roles;
		this.mentionChannels = data.mention_channels;*/
		this.attachments = data.attachments.map((attachment) => new MessageAttachment(attachment));
		this.embeds = data.embeds.map((embed) => new Embed(embed));
		this.reactions = data.reactions;
		this.nonce = data.nonce;
		this.pinned = data.pinned;
		this.webhookId = data.webhook_id;
		this.type = data.type;
		this.flags = data.flags;
		this.stickers = data.stickers?.map((sticker) => new Sticker(this.client, sticker));
	}

	public get guild(): Guild | undefined {
		return this.channel.guild;
	}

	public get member(): GuildMember | undefined {
		return this.guild ? this.guild.members.get(this.author.id) : undefined;
	}

	public get url(): string {
		return `https://discord.com/channels/${this.guild ? this.guild.id : '@me'}/${this.channel.id}/${this.id}`;
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public get editedAt(): Date | undefined {
		return this.editedTimestamp ? new Date(this.editedTimestamp) : undefined;
	}

	public toString(): string {
		return this.content;
	}
}
