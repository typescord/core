import { GatewayVoiceState, Snowflake } from 'discord-api-types';
import { StageChannel } from '../channel/voice/StageChannel';
import { VoiceChannel } from '../channel/voice/VoiceChannel';
import { Guild } from '../guild/Guild';
import { GuildMember } from '../guild/GuildMember';

/**
 * Structure representing a user's voice connection status
 */
export class VoiceState {
	/**
	 * The id of the channel the user is connected to
	 */
	public channelId?: Snowflake;

	/**
	 * The id of the user this voice state is for
	 */
	public userId!: Snowflake;

	/**
	 * The guild member this voice state is for
	 */
	public member?: GuildMember;

	/**
	 *  The id of the session for this voice state
	 */
	public sessionId!: string;

	/**
	 * Whether this user is deafened by the server
	 */
	public serverDeaf!: boolean;

	/**
	 * Whether this user is muted by the server
	 */
	public serverMute!: boolean;

	/**
	 * Whether this user is locally deafened
	 */
	public selfDeaf!: boolean;

	/**
	 * Whether this user is locally muted
	 */
	public selfMute!: boolean;

	/**
	 * Whether this user is streaming using "Go Live"
	 */
	public selfStream?: boolean;

	/**
	 * Whether the camera of this user is enabled
	 */
	public selfVideo!: boolean;

	/**
	 * Whether this user is muted by the current user
	 */
	public suppress!: boolean;

	/**
	 * The date when the user requested to speak
	 */
	public requestToSpeakAt?: Date;

	/**
	 * The timestamp when the user requested to speak
	 */
	public requestToSpeakTimestamp?: number;

	public constructor(public readonly guild: Guild, data: GatewayVoiceState) {
		this.$patch(data);
	}

	public $patch(data: GatewayVoiceState): void {
		this.channelId = data.channel_id ?? undefined;
		this.userId = data.user_id;
		this.member = data.member && new GuildMember(this.guild, data.member);
		this.sessionId = data.session_id;
		this.serverDeaf = data.deaf;
		this.serverMute = data.mute;
		this.selfDeaf = data.self_deaf;
		this.selfMute = data.self_mute;
		this.selfStream = data.self_stream;
		this.selfVideo = data.self_video;
		this.suppress = data.suppress;
		this.requestToSpeakAt = data.request_to_speak_timestamp ? new Date(data.request_to_speak_timestamp) : undefined;
		this.requestToSpeakTimestamp = this.requestToSpeakAt?.getTime();
	}

	/**
	 * The channel the user is connected to
	 */
	public get channel(): VoiceChannel | StageChannel | undefined {
		return this.channelId ? this.guild.channels.get(this.channelId) : undefined;
	}

	/**
	 * Whether this user is deafened
	 */
	public get deaf(): boolean {
		return this.serverDeaf || this.selfDeaf;
	}

	/**
	 * Whether this user is muted
	 */
	public get mute(): boolean {
		return this.serverMute || this.selfMute;
	}
}
