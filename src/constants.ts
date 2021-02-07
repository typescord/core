import { version, homepage } from '../package.json';
import { Error, RangeError } from './errors';

export const ActivityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM_STATUS', 'COMPETING'] as const;
export const UserAgent = `DiscordBot (${homepage.split('#', 1)}, ${version}) Node.js/${process.version}`;

export enum WSCodes {
  WS_CLOSE_REQUESTED = 1000,
  TOKEN_INVALID = 4004,
  SHARDING_INVALID = 4010,
  SHARDING_REQUIRED,
  INVALID_INTENTS = 4013,
  DISALLOWED_INTENTS,
}

const AllowedImageFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'] as const;
type AllowedImageFormatsType = typeof AllowedImageFormats[number];
const AllowedImageSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096] as const;
type AllowedImageSizesType = typeof AllowedImageSizes[number];

interface MakeImageUrlOptions {
  format: AllowedImageFormatsType;
  size?: AllowedImageSizesType;
}
function makeImageUrl(root: string, { format, size }: MakeImageUrlOptions = { format: 'jpg' }): string {
  if (format && !AllowedImageFormats.includes(format)) throw new Error('IMAGE_FORMAT', format);
  if (size && !AllowedImageSizes.includes(size)) throw new RangeError('IMAGE_SIZE', size);
  return `${root}.${format}${size ? `?size=${size}` : ''}`;
}

export const Endpoints = {
  CDN(root: string) {
    return {
      Emoji: (emojiID: string, format = 'png') => `${root}/emojis/${emojiID}.${format}`,
      Asset: (name: string) => `${root}/assets/${name}`,
      DefaultAvatar: (discriminator: string) => `${root}/embed/avatars/${discriminator}.png`,
      Avatar: (
        userID: string,
        hash: string,
        format: AllowedImageFormatsType = 'jpg',
        size?: AllowedImageSizesType,
        dynamic = false,
      ) => {
        if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/avatars/${userID}/${hash}`, { format, size });
      },
      Banner: (guildID: string, hash: string, format: AllowedImageFormatsType = 'jpg', size?: AllowedImageSizesType) =>
        makeImageUrl(`${root}/banners/${guildID}/${hash}`, { format, size }),
      Icon: (
        guildID: string,
        hash: string,
        format: AllowedImageFormatsType = 'jpg',
        size?: AllowedImageSizesType,
        dynamic = false,
      ) => {
        if (dynamic) format = hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/icons/${guildID}/${hash}`, { format, size });
      },
      AppIcon: (clientID: string, hash: string, options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/app-icons/${clientID}/${hash}`, options),
      AppAsset: (clientID: string, hash: string, options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/app-assets/${clientID}/${hash}`, options),
      GDMIcon: (channelID: string, hash: string, options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/channel-icons/${channelID}/${hash}`, options),
      Splash: (guildID: string, hash: string, format = 'jpg', options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/splashes/${guildID}/${hash}`, options),
      DiscoverySplash: (guildID: string, hash: string, options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/discovery-splashes/${guildID}/${hash}`, options),
      TeamIcon: (teamID: string, hash: string, options?: MakeImageUrlOptions) =>
        makeImageUrl(`${root}/team-icons/${teamID}/${hash}`, options),
    } as const;
  },
  invite: (root: string, code: string): string => `${root}/${code}`,
  botGateway: '/gateway/bot',
} as const;

export enum ChannelTypes {
  TEXT,
  DM,
  VOICE,
  GROUP,
  CATEGORY,
  NEWS,
  STORE,
}

export enum Status {
  READY = 0,
  CONNECTING = 1,
  RECONNECTING = 2,
  IDLE = 3,
  NEARLY = 4,
  DISCONNECTED = 5,
  WAITING_FOR_GUILDS = 6,
  IDENTIFYING = 7,
  RESUMING = 8,
}

export enum VoiceStatus {
  CONNECTED = 0,
  CONNECTING = 1,
  AUTHENTICATING = 2,
  RECONNECTING = 3,
  DISCONNECTED = 4,
}

export enum OPCodes {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  STATUS_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  VOICE_GUILD_PING = 5,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11,
}

export enum VoiceOPCodes {
  IDENTIFY = 0,
  SELECT_PROTOCOL = 1,
  READY = 2,
  HEARTBEAT = 3,
  SESSION_DESCRIPTION = 4,
  SPEAKING = 5,
  HELLO = 8,
  CLIENT_CONNECT = 12,
  CLIENT_DISCONNECT = 13,
}

export enum Events {
  RATE_LIMIT = 'rateLimit',
  CLIENT_READY = 'ready',
  GUILD_CREATE = 'guildCreate',
  GUILD_DELETE = 'guildDelete',
  GUILD_UPDATE = 'guildUpdate',
  GUILD_UNAVAILABLE = 'guildUnavailable',
  GUILD_AVAILABLE = 'guildAvailable',
  GUILD_MEMBER_ADD = 'guildMemberAdd',
  GUILD_MEMBER_REMOVE = 'guildMemberRemove',
  GUILD_MEMBER_UPDATE = 'guildMemberUpdate',
  GUILD_MEMBER_AVAILABLE = 'guildMemberAvailable',
  GUILD_MEMBER_SPEAKING = 'guildMemberSpeaking',
  GUILD_MEMBERS_CHUNK = 'guildMembersChunk',
  GUILD_INTEGRATIONS_UPDATE = 'guildIntegrationsUpdate',
  GUILD_ROLE_CREATE = 'roleCreate',
  GUILD_ROLE_DELETE = 'roleDelete',
  INVITE_CREATE = 'inviteCreate',
  INVITE_DELETE = 'inviteDelete',
  GUILD_ROLE_UPDATE = 'roleUpdate',
  GUILD_EMOJI_CREATE = 'emojiCreate',
  GUILD_EMOJI_DELETE = 'emojiDelete',
  GUILD_EMOJI_UPDATE = 'emojiUpdate',
  GUILD_BAN_ADD = 'guildBanAdd',
  GUILD_BAN_REMOVE = 'guildBanRemove',
  CHANNEL_CREATE = 'channelCreate',
  CHANNEL_DELETE = 'channelDelete',
  CHANNEL_UPDATE = 'channelUpdate',
  CHANNEL_PINS_UPDATE = 'channelPinsUpdate',
  MESSAGE_CREATE = 'message',
  MESSAGE_DELETE = 'messageDelete',
  MESSAGE_UPDATE = 'messageUpdate',
  MESSAGE_BULK_DELETE = 'messageDeleteBulk',
  MESSAGE_REACTION_ADD = 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE = 'messageReactionRemove',
  MESSAGE_REACTION_REMOVE_ALL = 'messageReactionRemoveAll',
  MESSAGE_REACTION_REMOVE_EMOJI = 'messageReactionRemoveEmoji',
  USER_UPDATE = 'userUpdate',
  PRESENCE_UPDATE = 'presenceUpdate',
  VOICE_SERVER_UPDATE = 'voiceServerUpdate',
  VOICE_STATE_UPDATE = 'voiceStateUpdate',
  VOICE_BROADCAST_SUBSCRIBE = 'subscribe',
  VOICE_BROADCAST_UNSUBSCRIBE = 'unsubscribe',
  TYPING_START = 'typingStart',
  TYPING_STOP = 'typingStop',
  WEBHOOKS_UPDATE = 'webhookUpdate',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  SHARD_DISCONNECT = 'shardDisconnect',
  SHARD_ERROR = 'shardError',
  SHARD_RECONNECTING = 'shardReconnecting',
  SHARD_READY = 'shardReady',
  SHARD_RESUME = 'shardResume',
  INVALIDATED = 'invalidated',
  RAW = 'raw',
}

export enum ShardEvents {
  CLOSE = 'close',
  DESTROYED = 'destroyed',
  INVALID_SESSION = 'invalidSession',
  READY = 'ready',
  RESUMED = 'resumed',
  ALL_READY = 'allReady',
}

export const PartialTypes = ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'];

export const WSEvents = [
  'READY',
  'RESUMED',
  'GUILD_CREATE',
  'GUILD_DELETE',
  'GUILD_UPDATE',
  'INVITE_CREATE',
  'INVITE_DELETE',
  'GUILD_MEMBER_ADD',
  'GUILD_MEMBER_REMOVE',
  'GUILD_MEMBER_UPDATE',
  'GUILD_MEMBERS_CHUNK',
  'GUILD_INTEGRATIONS_UPDATE',
  'GUILD_ROLE_CREATE',
  'GUILD_ROLE_DELETE',
  'GUILD_ROLE_UPDATE',
  'GUILD_BAN_ADD',
  'GUILD_BAN_REMOVE',
  'GUILD_EMOJIS_UPDATE',
  'CHANNEL_CREATE',
  'CHANNEL_DELETE',
  'CHANNEL_UPDATE',
  'CHANNEL_PINS_UPDATE',
  'MESSAGE_CREATE',
  'MESSAGE_DELETE',
  'MESSAGE_UPDATE',
  'MESSAGE_DELETE_BULK',
  'MESSAGE_REACTION_ADD',
  'MESSAGE_REACTION_REMOVE',
  'MESSAGE_REACTION_REMOVE_ALL',
  'MESSAGE_REACTION_REMOVE_EMOJI',
  'USER_UPDATE',
  'PRESENCE_UPDATE',
  'TYPING_START',
  'VOICE_STATE_UPDATE',
  'VOICE_SERVER_UPDATE',
  'WEBHOOKS_UPDATE',
];

export const DefaultMessageNotifications = ['ALL', 'MENTIONS'] as const;
exports.ExplicitContentFilterLevels = ['DISABLED', 'MEMBERS_WITHOUT_ROLES', 'ALL_MEMBERS'];

export const VerificationLevels = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;

export enum MembershipStates {
  INVITED = 1,
  ACCEPTED,
}

export enum WebhookTypes {
  Incoming = 1,
  'Channel Follower',
}

export enum SystemMessageTypes {
  RECIPIENT_ADD = 1,
  RECIPIENT_REMOVE,
  CALL,
  CHANNEL_NAME_CHANGE,
  CHANNEL_ICON_CHANGE,
  PINS_ADD,
  GUILD_MEMBER_JOIN,
  USER_PREMIUM_GUILD_SUBSCRIPTION,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3,
  CHANNEL_FOLLOW_ADD,
  GUILD_DISCOVERY_DISQUALIFIED = 14,
  GUILD_DISCOVERY_REQUALIFIED,
}

export const MessageTypes = {
  ...SystemMessageTypes,
  DEFAULT: 0,
  REPLYT: 19,
} as const;

export enum ClientApplicationAssetTypes {
  SMALL = 1,
  BIG,
}

export enum Colors {
  DEFAULT = 0x000000,
  WHITE = 0xffffff,
  AQUA = 0x1abc9c,
  GREEN = 0x2ecc71,
  BLUE = 0x3498db,
  YELLOW = 0xffff00,
  PURPLE = 0x9b59b6,
  LUMINOUS_VIVID_PINK = 0xe91e63,
  GOLD = 0xf1c40f,
  ORANGE = 0xe67e22,
  RED = 0xe74c3c,
  GREY = 0x95a5a6,
  NAVY = 0x34495e,
  DARK_AQUA = 0x11806a,
  DARK_GREEN = 0x1f8b4c,
  DARK_BLUE = 0x206694,
  DARK_PURPLE = 0x71368a,
  DARK_VIVID_PINK = 0xad1457,
  DARK_GOLD = 0xc27c0e,
  DARK_ORANGE = 0xa84300,
  DARK_RED = 0x992d22,
  DARK_GREY = 0x979c9f,
  DARKER_GREY = 0x7f8c8d,
  LIGHT_GREY = 0xbcc0c0,
  DARK_NAVY = 0x2c3e50,
  BLURPLE = 0x7289da,
  GREYPLE = 0x99aab5,
  DARK_BUT_NOT_BLACK = 0x2c2f33,
  NOT_QUITE_BLACK = 0x23272a,
}

export enum APIErrors {
  UNKNOWN_ACCOUNT = 10001,
  UNKNOWN_APPLICATION,
  UNKNOWN_CHANNEL,
  UNKNOWN_GUILD,
  UNKNOWN_INTEGRATION,
  UNKNOWN_INVITE,
  UNKNOWN_MEMBER,
  UNKNOWN_MESSAGE,
  UNKNOWN_OVERWRITE,
  UNKNOWN_PROVIDER,
  UNKNOWN_ROLE,
  UNKNOWN_TOKEN,
  UNKNOWN_USER,
  UNKNOWN_EMOJI,
  UNKNOWN_WEBHOOK,
  UNKNOWN_BAN = 10026,
  UNKNOWN_GUILD_TEMPLATE = 10057,

  BOT_PROHIBITED_ENDPOINT = 20001,
  BOT_ONLY_ENDPOINT,
  CHANNEL_HIT_WRITE_RATELIMIT = 20028,

  MAXIMUM_GUILDS = 30001,
  MAXIMUM_FRIENDS,
  MAXIMUM_PINS,
  MAXIMUM_ROLES = 30005,
  MAXIMUM_WEBHOOKS = 30007,
  MAXIMUM_REACTIONS = 30010,
  MAXIMUM_CHANNELS = 30013,
  MAXIMUM_ATTACHMENTS = 30015,
  MAXIMUM_INVITES,

  GUILD_ALREADY_HAS_TEMPLATE = 30031,
  UNAUTHORIZED = 40001,
  ACCOUNT_VERIFICATION_REQUIRED,
  REQUEST_ENTITY_TOO_LARGE = 40005,
  FEATURE_TEMPORARILY_DISABLED,
  USER_BANNED,
  ALREADY_CROSSPOSTED = 40033,
  MISSING_ACCESS = 50001,
  INVALID_ACCOUNT_TYPE,
  CANNOT_EXECUTE_ON_DM,
  EMBED_DISABLED,
  CANNOT_EDIT_MESSAGE_BY_OTHER,
  CANNOT_SEND_EMPTY_MESSAGE,
  CANNOT_MESSAGE_USER,
  CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL,
  CHANNEL_VERIFICATION_LEVEL_TOO_HIGH,
  OAUTH2_APPLICATION_BOT_ABSENT,
  MAXIMUM_OAUTH2_APPLICATIONS,
  INVALID_OAUTH_STATE,
  MISSING_PERMISSIONS,
  INVALID_AUTHENTICATION_TOKEN,
  NOTE_TOO_LONG,
  INVALID_BULK_DELETE_QUANTITY,
  CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL = 50019,
  INVALID_OR_TAKEN_INVITE_CODE,
  CANNOT_EXECUTE_ON_SYSTEM_MESSAGE,
  INVALID_OAUTH_TOKEN = 50025,
  BULK_DELETE_MESSAGE_TOO_OLD = 50034,
  INVALID_FORM_BODY,
  INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT = 50036,
  INVALID_API_VERSION = 50041,
  CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL = 50074,
  REACTION_BLOCKED = 90001,
  RESOURCE_OVERLOADED = 130000,
}
