import {
	APIMessage,
	APIReaction,
	InteractionType,
	MessageActivityType,
	MessageFlags,
	MessageType,
	Snowflake,
} from 'discord-api-types';
import { Client } from '../../../clients';
import { Guild } from '../guild/Guild';
/*import { GuildChannel } from '../channel/GuildChannel';
import { GuildMember } from '../guild/GuildMember';*/
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
	public id!: Snowflake;
	public channelId!: Snowflake;
	public guildId?: Snowflake;
	public author!: User;
	public content!: string;
	public createdTimestamp!: number;
	public createdAt!: Date;
	public editedTimestamp?: number;
	public editedAt?: Date;
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
	public guild!: Guild;
	public url!: string;

	public constructor(public readonly client: Client, data: APIMessage) {
		this.$patch(data);
	}

	public $patch(data: APIMessage): void {
		this.id = data.id;
		this.channelId = data.channel_id;
		this.guildId = data.guild_id;
		this.author = new User(this.client, data.author);
		this.content = data.content;
		this.createdTimestamp = Number(data.timestamp);
		this.createdAt = new Date(data.timestamp);
		this.editedTimestamp = Number(data.edited_timestamp);
		this.editedAt = this.editedTimestamp ? new Date(this.editedTimestamp) : undefined;
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
		this.activity = data.activity && {
			type: data.activity.type,
			partyId: data.activity.party_id,
		};
		this.application = data.application && new Application(this.client, data.application);
		this.messageReference = data.message_reference && {
			messageId: data.message_reference.message_id,
			channelId: data.message_reference.channel_id,
			guildId: data.message_reference.guild_id,
		};
		this.flags = data.flags;
		this.stickers = data.stickers?.map((sticker) => new Sticker(this.client, sticker));
		// this.referencedMessage = data.referenced_message ? new Message(this.channel, data.referenced_message) : undefined;
		this.interaction = data.interaction && {
			...data.interaction,
			user: new User(this.client, data.interaction.user),
		};
		this.url = `https://discord.com/channels/${this.guildId || '@me'}/${this.channelId}/${this.id}`;
	}

	/*public get member(): GuildMember | undefined {
		return this.guild ? this.guild.members.get(this.author.id) : undefined;
	}*/

	public toString(): string {
		return this.content;
	}
}
