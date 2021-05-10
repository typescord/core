import { APIGuildMember, Snowflake } from 'discord-api-types';
import { Guild } from '../guild/Guild';
import { User } from '../User';

export class GuildMember {
	public user?: User;
	public nickname?: string;
	public roles!: Snowflake[];
	public joinedAt!: Date;
	public premiumSince?: Date;
	public deaf!: boolean;
	public mute!: boolean;
	public pending!: boolean;

	public constructor(public readonly guild: Guild, data: APIGuildMember) {
		this.$patch(data);
	}

	public $patch(data: APIGuildMember): void {
		if (data.user) {
			this.user = new User(this.guild.client, data.user);
		}

		if (data.premium_since) {
			this.premiumSince = new Date(data.premium_since);
		}

		if (data.nick) {
			this.nickname = data.nick;
		}

		this.roles = data.roles;
		this.joinedAt = new Date(data.joined_at);
		this.deaf = data.deaf;
		this.mute = data.mute;
		this.pending = !!data.pending;
	}

	public get id(): Snowflake | undefined {
		return this.user?.id;
	}

	public get displayName(): string | undefined {
		return this.nickname ?? this.user?.username;
	}

	public get joinedTimestamp(): number {
		return this.joinedAt.getTime();
	}

	public get premiumSinceTimestamp(): number | undefined {
		return this.premiumSince?.getTime();
	}

	public toString(): string {
		return this.user ? `<@${this.nickname ? '!' : ''}${this.user.id}>` : '';
	}
}
