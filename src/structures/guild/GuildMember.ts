import { APIGuildMember, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { User } from '../User';

export class GuildMember {
	public user?: User;
	public id?: Snowflake;
	public nickname?: string;
	public roles!: Snowflake[];
	public joinedAt!: Date;
	public joinedTimestamp?: number;
	public premiumSince?: Date;
	public premiumSinceTimestamp?: number;
	public deaf!: boolean;
	public mute!: boolean;
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

	public get displayName(): string | undefined {
		return this.nickname ?? this.user?.username;
	}

	public toString(): string {
		return this.user ? `<@$!${this.user.id}>` : '';
	}
}
