import { APIGuildMember, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { User } from '../User';

/**
 * Structure representing a guild member
 */
export class GuildMember {
	/**
	 * The user the guild member represents
	 */
	public user?: User;

	/**
	 * The id of the user
	 */
	public id?: Snowflake;

	/**
	 * The nickname of the guid member
	 */
	public nickname?: string;

	/**
	 * The roles of the guid member
	 */
	public roles!: Snowflake[];

	/**
	 * The date when the user joined the guild
	 */
	public joinedAt!: Date;

	/**
	 * The timestamp when the user joined the guild
	 */
	public joinedTimestamp?: number;

	/**
	 * The date when the user started boosting the guild
	 */
	public premiumSince?: Date;

	/**
	 * The timestamps when the user started boosting the guild
	 */
	public premiumSinceTimestamp?: number;

	/**
	 * Whether the user is deafened in voice channels
	 */
	public deaf!: boolean;

	/**
	 * Whether the user is muted in voice channels
	 */
	public mute!: boolean;

	/**
	 * Whether the user has not yet passed the guild's membership screening requirements
	 */
	public pending?: boolean;

	public constructor(public readonly guild: Guild, data: APIGuildMember) {
		this.$patch(data);
	}

	public $patch(data: APIGuildMember): void {
		this.user = data.user ? new User(this.guild.client, data.user) : undefined;
		this.id = this.user?.id;
		this.nickname = data.nick ?? undefined;
		this.roles = data.roles;
		this.joinedAt = new Date(data.joined_at);
		this.joinedTimestamp = this.joinedAt.getTime();
		this.premiumSince = data.premium_since ? new Date(data.premium_since) : undefined;
		this.premiumSinceTimestamp = this.premiumSince?.getTime();
		this.deaf = data.deaf;
		this.mute = data.mute;
		this.pending = data.pending;
	}

	/**
	 * The name  of the guid member that is displayed in the guild
	 */
	public get displayName(): string | undefined {
		return this.nickname ?? this.user?.username;
	}

	public toString(): string {
		return this.user ? `<@$!${this.user.id}>` : '';
	}
}
