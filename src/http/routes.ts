import { ReadStream } from 'fs';
import { Snowflake } from 'discord-api-types';
import { routify, StaticRoute } from './routing';
import type * as d from 'discord-api-types/rest/v8';

// eslint-disable-next-line @typescript-eslint/naming-convention
type _ = undefined;

// Gateway
export const getGateway = '/gateway' as StaticRoute<d.RESTGetAPIGatewayResult>;
export const getGatewayBot = '/gateway/bot' as StaticRoute<d.RESTGetAPIGatewayBotResult>;

// OAuth2
export const getCurrentBotApplicationInformation =
	'/oauth2/applications/@me' as StaticRoute<d.RESTGetAPIOauth2CurrentApplicationResult>;
export const getCurrentAuthorizationInformation =
	'/oauth2/@me' as StaticRoute<d.RESTGetAPIOauth2CurrentAuthorizationResult>;

// Channels
export const getChannel = routify<d.RESTGetAPIChannelResult, undefined, ['channelId']>`/channels/${'channelId'}`;
export const modifyChannel = routify<
	d.RESTPatchAPIChannelResult,
	{ json: d.RESTPatchAPIChannelJSONBody | { name: string; icon: string } }, // no type for DM Group
	['channelId']
>`/channels/${'channelId'}`;
export const deleteCloseChannel = routify<d.RESTDeleteAPIChannelResult, _, ['channelId']>`/channels/${'channelId'}`;

// Channel permissions
export const editChannelPermissions = routify<
	_,
	{ json: d.RESTPutAPIChannelPermissionJSONBody },
	['channelId', 'overwriteId']
>`/channels/${'channelId'}/permissions/${'overwriteId'}`;
export const deleteChannelPermissions = routify`/channels/${'channelId'}/permissions/${'overwriteId'}`;

// Channel invites
export const getChannelInvites = routify<
	d.RESTGetAPIChannelInvitesResult,
	_,
	['channelId']
>`/channels/${'channelId'}/invites`;
export const createChannelInvite = routify<
	d.RESTPostAPIChannelInviteResult,
	{ json: d.RESTPostAPIChannelInviteJSONBody },
	['channelId']
>`/channels/${'channelId'}/invites`;

// Channel messages
export const getChannelMessages = routify<
	d.RESTGetAPIChannelMessagesResult,
	{ query: d.RESTGetAPIChannelMessagesQuery },
	['channelId']
>`/channels/${'channelId'}/messages`;
export const getChannelMessage = routify<
	d.RESTGetAPIChannelMessageResult,
	_,
	['channelId', 'messageId']
>`/channels/${'channelId'}/messages/${'messageId'}`;
export const createMessage = routify<
	d.RESTPostAPIChannelMessageResult,
	{ attachments: Record<string, string | Buffer | ReadStream>; json: d.RESTPostAPIChannelMessageJSONBody },
	['channelId']
>`/channels/${'channelId'}/messages`;
export const crosspostMessage = routify<
	d.RESTPostAPIChannelMessageCrosspostResult,
	_,
	['channelId', 'messageId']
>`/channels/${'channelId'}/messages/${'messageId'}/crosspost`;
export const editMessage = routify<
	d.RESTPatchAPIChannelMessageResult,
	{ query: d.RESTPatchAPIChannelMessageJSONBody },
	['channelId', 'messageId']
>`/channels/${'channelId'}/messages/${'messageId'}`;
export const deleteMessage = routify`/channels/${'channelId'}/messages/${'messageId'}`;
export const bulkDeleteMessages = routify<
	_,
	{ query: d.RESTPostAPIChannelMessagesBulkDeleteJSONBody },
	['channelId']
>`/channels/${'channelId'}/messages/bulk-delete`;

// Channel message reactions
export const getReactions = routify<
	d.RESTGetAPIChannelMessageReactionUsersResult,
	{ query: d.RESTGetAPIChannelMessageReactionUsersQuery },
	['channelId', 'messageId', 'emoji']
>`/channels/${'channelId'}/messages/${'messageId'}/reactions/${'emoji'}`;
export const createReaction = routify`/channels/${'channelId'}/messages/${'messageId'}/reactions/${'emoji'}/@me`;
export const deleteCurrentUserReaction = routify`/channels/${'channelId'}/messages/${'messageId'}/reactions/${'emoji'}/@me`;
export const deleteUserReaction = routify`/channels/${'channelId'}/messages/${'messageId'}/reactions/${'emoji'}/${'userId'}`;
export const deleteAllReactions = routify`/channels/${'channelId'}/messages/${'messageId'}/reactions`;
export const deleteAllReactionsEmoji = routify`/channels/${'channelId'}/messages/${'messageId'}/reactions/${'emoji'}`;

// Channel pinned messages
export const getPinnedMessages = routify<
	d.RESTGetAPIChannelPinsResult,
	_,
	['channelId']
>`/channels/${'channelId'}/pins`;
export const addPinnedMessage = routify`/channels/${'channelId'}/pins/${'messageId'}`;
export const deletePinnedMessage = routify`/channels/${'channelId'}/pins/${'messageId'}`;

// Channel webhooks
export const createChannelWebhook = routify<
	d.RESTPostAPIChannelWebhookResult,
	{ json: d.RESTPostAPIChannelWebhookJSONBody },
	['channelId']
>`/channels/${'channelId'}/webhooks`;
export const getChannelWebhooks = routify<
	d.RESTGetAPIChannelWebhooksResult,
	_,
	['channelId']
>`/channels/${'channelId'}/webhooks`;

// News channel
export const followNewsChannel = routify<
	d.RESTPostAPIChannelFollowersResult,
	{ json: d.RESTPostAPIChannelFollowersJSONBody },
	['channelId']
>`/channels/${'channelId'}/followers`;

// Group DM
export const addGroupDMRecipient = routify<
	_,
	{ json: d.RESTPutAPIChannelRecipientJSONBody },
	['channelId', 'userId']
>`/channels/${'channelId'}/recipients/${'userId'}`;
export const removeGroupDMRecipient = routify`/channels/${'channelId'}/recipients/${'userId'}`;

// Channel typing
export const triggerTypingIndicator = routify`/channels/${'channelId'}/typing`;

// Guilds
export const createGuild = `/guilds` as StaticRoute<d.RESTPostAPIGuildsResult, { json: d.RESTPostAPIGuildsJSONBody }>;
export const getGuild = routify<
	d.RESTGetAPIGuildResult,
	{ query: d.RESTGetAPIGuildQuery },
	['guildId']
>`/guilds/${'guildId'}`;
export const modifyGuild = routify<
	d.RESTPatchAPIGuildResult,
	{ json: d.RESTPatchAPIGuildJSONBody },
	['guildId']
>`/guilds/${'guildId'}`;
export const deleteGuild = routify`/guilds/${'guildId'}`;

// Guild channels
export const getGuildChannels = routify<d.RESTGetAPIGuildChannelsResult, _, ['guildId']>`/guilds/${'guildId'}/channels`;
export const createGuildChannel = routify<
	d.RESTPostAPIGuildChannelResult,
	{ json: d.RESTPostAPIGuildChannelJSONBody },
	['guildId']
>`/guilds/${'guildId'}/channels`;
export const modifyGuildChannelPosition = routify<
	_,
	{ json: d.RESTPatchAPIGuildChannelPositionsJSONBody },
	['guildId']
>`/guilds/${'guildId'}/channels`;

// Guild members
export const getGuildMembers = routify<
	d.RESTGetAPIGuildMembersResult,
	{ query: d.RESTGetAPIGuildMembersQuery },
	['guildId']
>`/guilds/${'guildId'}/members/`;
export const getGuildMember = routify<
	d.RESTGetAPIGuildMemberResult,
	_,
	['guildId', 'userId']
>`/guilds/${'guildId'}/members/${'userId'}`;
export const searchGuildMembers = routify<
	d.RESTGetAPIGuildMembersSearchResult,
	{ query: d.RESTGetAPIGuildMembersSearchQuery },
	['guildId']
>`/guilds/${'guildId'}/members/search`;
export const addGuildMember = routify<
	d.RESTPutAPIGuildMemberResult,
	{ json: d.RESTPutAPIGuildMemberJSONBody },
	['guildId', 'userId']
>`/guilds/${'guildId'}/members/${'userId'}`;
export const modifyGuildMember = routify<
	d.RESTPatchAPIGuildMemberResult,
	{ json: d.RESTPatchAPIGuildMemberJSONBody },
	['guildId', 'userId']
>`/guilds/${'guildId'}/members/${'userId'}`;
export const removeGuildMember = routify`/guilds/${'guildId'}/members/${'userId'}`;

export const modifyCurrentUserNickname = routify<
	d.RESTPatchAPICurrentGuildMemberNicknameResult,
	{ json: d.RESTPatchAPICurrentGuildMemberNicknameJSONBody },
	['guildId']
>`/guilds/${'guildId'}/members/@me/nick`;

// Guild member roles
export const addGuildMemberRole = routify`/guilds/${'guildId'}/members/${'userId'}/roles/${'roleId'}`;
export const removeGuildMemberRole = routify`/guilds/${'guildId'}/members/${'userId'}/roles/${'roleId'}`;

// Guild roles
export const getGuildRoles = routify<d.RESTGetAPIGuildRolesResult, _, ['guildId']>`/guilds/${'guildId'}/roles/`;
export const createGuildRole = routify<
	d.RESTPostAPIGuildRoleResult,
	{ json: d.RESTPostAPIGuildRoleJSONBody },
	['guildId']
>`/guilds/${'guildId'}/roles/`;
export const modifyGuildRolePositions = routify<
	d.RESTPatchAPIGuildRolePositionsResult,
	{ json: d.RESTPatchAPIGuildRolePositionsJSONBody },
	['guildId']
>`/guilds/${'guildId'}/roles/`;
export const modifyGuildRole = routify<
	d.RESTPatchAPIGuildRoleResult,
	{ json: d.RESTPatchAPIGuildRoleJSONBody },
	['guildId', 'roleId']
>`/guilds/${'guildId'}/roles/${'roleId'}`;
export const deleteGuildRole = routify`/guilds/${'guildId'}/roles/${'roleId'}`;

// Guild prune
export const getGuildPruneCount = routify<
	d.RESTGetAPIGuildPruneCountResult,
	{ query: d.RESTGetAPIGuildPruneCountQuery },
	['guildId']
>`/guilds/${'guildId'}/prune`;
export const beginGuildPrune = routify<
	d.RESTPostAPIGuildPruneResult,
	{ json: d.RESTPostAPIGuildPruneJSONBody },
	['guildId']
>`/guilds/${'guildId'}/prune`;

// Guild bans
export const getGuildBans = routify<d.RESTGetAPIGuildBansResult, _, ['guildId']>`/guilds/${'guildId'}/bans`;
export const getGuildBan = routify<
	d.RESTGetAPIGuildBanResult,
	_,
	['guildId', 'userId']
>`/guilds/${'guildId'}/bans/${'userId'}`;
export const createGuildBan = routify<
	_,
	{ json: d.RESTPutAPIGuildBanJSONBody },
	['guildId', 'userId']
>`/guilds/${'guildId'}/bans/${'userId'}`;
export const removeGuildBan = routify`/guilds/${'guildId'}/bans/${'userId'}`;

// Guild integrations
export const getGuildIntegrations = routify<
	d.RESTGetAPIGuildIntegrationsResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/integrations`;
export const deleteGuildIntecration = routify`/guilds/${'guildId'}/integrations/${'integrationId'}`;

// Guild widget
export const getGuildWidgetSettings = routify<
	d.RESTGetAPIGuildWidgetSettingsResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/widget`;
export const modifyGuildWidget = routify<
	d.RESTPatchAPIGuildWidgetSettingsResult,
	{ json: d.RESTPatchAPIGuildWidgetSettingsJSONBody },
	['guildId']
>`/guilds/${'guildId'}/widget`;
export const getGuildWidget = routify<
	d.RESTGetAPIGuildWidgetJSONResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/widget.json`;
export const getGuildWidgetImage = routify<
	d.RESTGetAPIGuildWidgetImageResult,
	{ query: d.RESTGetAPIGuildWidgetImageQuery },
	['guildId']
>`/guilds/${'guildId'}/widget.png`;

// Guild welcome screen
export const getGuildWelcomeScreen = routify<
	d.RESTGetAPIGuildWelcomeScreenResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/welcome-screen`;
export const modifyGuildWelcomeScreen = routify<
	d.RESTGetAPIGuildWelcomeScreenResult, // no d.RESTPatchAPIGuildWelcomeScreenResult
	{ json: d.RESTPatchAPIGuildWelcomeScreenJSONBody },
	['guildId']
>`/guilds/${'guildId'}/welcome-screen`;

// Guild voice state
export const updateCurrentUserVoiceState = routify<
	_,
	{ json: d.RESTPatchAPIGuildVoiceStateCurrentMemberJSONBody },
	['guildId']
>`/guilds/${'guildId'}/voice-states/@me`;
export const updateUserVoiceState = routify<
	_,
	{ json: d.RESTPatchAPIGuildVoiceStateUserJSONBody },
	['guildId', 'userId']
>`/guilds/${'guildId'}/voice-states/${'userId'}`;

// Audit Log
export const getGuildAuditLog = routify<
	d.RESTGetAPIAuditLogResult,
	{ query: d.RESTGetAPIAuditLogQuery },
	['guildId']
>`/guilds/${'guildId'}/audit-logs`;

// Guild preview
export const getGuildPreview = routify<d.RESTGetAPIGuildPreviewResult, _, ['guildId']>`/guilds/${'guildId'}/preview`;

// Guild voice regions
export const getGuildVoiceRegions = routify<
	d.RESTGetAPIGuildVoiceRegionsResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/regions`;

// Guild vanity url
export const getGuildVanityUrl = routify<
	d.RESTGetAPIGuildVanityUrlResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/vanity-url`;

// Guild webhooks
export const getGuildWebhooks = routify<d.RESTGetAPIGuildWebhooksResult, _, ['guildId']>`/guilds/${'guildId'}/webhooks`;

// Guild emojis
export const createGuildEmoji = routify<
	d.RESTPostAPIGuildEmojiResult,
	{ json: d.RESTPostAPIGuildEmojiJSONBody },
	['guildId']
>`/guilds/${'guildId'}/emojis`;
export const getGuildEmojis = routify<d.RESTGetAPIGuildEmojisResult, _, ['guildId']>`/guilds/${'guildId'}/emojis`;
export const getGuildEmoji = routify<
	d.RESTGetAPIGuildEmojiResult,
	_,
	['guildId', 'emojiId']
>`/guilds/${'guildId'}/emojis/${'emojiId'}`;
export const modifyGuildEmoji = routify<
	d.RESTPatchAPIGuildEmojiResult,
	{ json: d.RESTPatchAPIGuildEmojiJSONBody },
	['guildId', 'emojiId']
>`/guilds/${'guildId'}/emojis/${'emojiId'}`;
export const deleteGuildEmoji = routify`/guilds/${'guildId'}/emojis/${'emojiId'}`;

// Guild templates
export const getTemplate = routify<
	d.RESTGetAPITemplateResult,
	_,
	['templateCode']
>`/guilds/templates/${'templateCode'}`;
export const createGuildFromTemplate = routify<
	d.RESTPostAPIGuildTemplatesResult,
	{ json: d.RESTPostAPIGuildTemplatesJSONBody },
	['templateCode']
>`/guilds/templates/${'templateCode'}`;
export const getGuildTemplates = routify<
	d.RESTGetAPIGuildTemplatesResult,
	_,
	['guildId']
>`/guilds/${'guildId'}/templates`;
export const createGuildTemplate = routify<
	d.RESTPostAPIGuildTemplatesResult,
	{ json: d.RESTPostAPIGuildTemplatesJSONBody },
	['guildId']
>`/guilds/${'guildId'}/templates`;
export const syncGuildTemplate = routify<
	d.RESTPutAPIGuildTemplateSyncResult,
	_,
	['guildId', 'templateCode']
>`/guilds/${'guildId'}/templates/${'templateCode'}`;
export const modifyGuildTemplate = routify<
	d.RESTPatchAPIGuildTemplateResult,
	{ json: d.RESTPatchAPIGuildTemplateJSONBody },
	['guildId', 'templateCode']
>`/guilds/${'guildId'}/templates/${'templateCode'}`;
export const deleteGuildTemplate = routify<
	d.RESTDeleteAPIGuildTemplateResult,
	_,
	['guildId', 'templateCode']
>`/guilds/${'guildId'}/templates/${'templateCode'}`;

// Guild invites
export const getGuildInvites = routify<d.RESTGetAPIGuildInvitesResult, _, ['guildId']>`/guilds/${'guildId'}/invites`;

// Invites
export const getInvite = routify<
	d.RESTGetAPIInviteResult,
	{ query: d.RESTGetAPIInviteQuery },
	['inviteCode']
>`/invites/${'inviteCode'}`;
export const deleteInvite = routify`/invites/${'inviteCode'}`;

// Users
export const getUser = routify<d.RESTGetAPIUserResult, _, ['userId']>`/users/${'userId'}`;
export const getCurrentUser = '/user/@me' as StaticRoute<d.RESTGetAPICurrentUserResult>;
export const modifyCurrentUser = '/user/@me' as StaticRoute<
	d.RESTPatchAPICurrentUserResult,
	{ json: d.RESTPatchAPICurrentUserJSONBody }
>;

// User guilds
export const getCurrentUserGuilds = '/user/@me/guilds' as StaticRoute<
	d.RESTGetAPICurrentUserGuildsResult,
	{ query: d.RESTGetAPICurrentUserGuildsQuery }
>;
export const leaveGuild = routify`/users/@me/guilds/${'guildId'}`;

// User DM
export const createDM = '/users/@me/channels' as StaticRoute<
	d.RESTPostAPICurrentUserCreateDMChannelResult,
	{ json: d.RESTPostAPICurrentUserCreateDMChannelJSONBody }
>;
export const createGroupDM = '/users/@me/channels' as StaticRoute<
	d.RESTPostAPICurrentUserCreateDMChannelResult,
	{ json: { access_tokens: string[]; nicks: Record<Snowflake, string> } }
>; // no d.RESTPostAPICurrentUserCreateGroupDMChannelResult and d.RESTPostAPICurrentUserCreateGroupDMChannelJSONBody

// User connections
export const getCurrentUserConnections =
	'/users/@me/connections' as StaticRoute<d.RESTGetAPICurrentUserConnectionsResult>;

// Voice regions
export const getVoiceRegions = '/voice/regions' as StaticRoute<d.GetAPIVoiceRegionsResult>;

// Webhooks
export const getWebhook = routify<d.RESTGetAPIWebhookResult, _, ['webhookId']>`/webhooks/${'webhookId'}`;
export const modifyWebhook = routify<
	d.RESTPatchAPIWebhookResult,
	{ json: d.RESTPatchAPIWebhookJSONBody },
	['webhookId']
>`/webhooks/${'webhookId'}`;
export const deleteWebhook = routify`/webhooks/${'webhookId'}`;
export const getWebhookWithToken = routify<
	d.RESTGetAPIWebhookWithTokenResult,
	_,
	['webhookId', 'webhookToken']
>`/webhooks/${'webhookId'}/${'webhookToken'}`;
export const modifyWebhookWithToken = routify<
	d.RESTPatchAPIWebhookWithTokenResult,
	{ json: d.RESTPatchAPIWebhookWithTokenJSONBody },
	['webhookId', 'webhookToken']
>`/webhooks/${'webhookId'}/${'webhookToken'}`;
export const deleteWebhookWithToken = routify`/webhooks/${'webhookId'}/${'webhookToken'}`;

// Webhook execution
export const executeWebhook = routify<
	_,
	{ query: d.RESTPostAPIWebhookWithTokenQuery; json: d.RESTPostAPIWebhookWithTokenJSONBody },
	['webhookId', 'webhookToken']
>`/webhooks/${'webhookId'}/${'webhookToken'}`;
export const executeSlackWebhook = routify<
	_,
	{ query: d.RESTPostAPIWebhookWithTokenSlackQuery },
	['webhookId', 'webhookToken']
>`/webhooks/${'webhookId'}/${'webhookToken'}/slack`;
export const executeGitHubWebhook = routify<
	_,
	{ query: d.RESTPostAPIWebhookWithTokenGitHubQuery },
	['webhookId', 'webhookToken']
>`/webhooks/${'webhookId'}/${'webhookToken'}/github`;

// Webhook message
export const getWebhookMessage = routify<
	d.RESTGetAPIWebhookWithTokenMessageResult,
	_,
	['webhookId', 'webhookToken', 'messageId']
>`/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`;
export const editWebhookMessage = routify<
	d.RESTPatchAPIWebhookWithTokenMessageResult,
	{ json: d.RESTPatchAPIWebhookWithTokenMessageJSONBody },
	['webhookId', 'webhookToken', 'messageId']
>`/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`;
export const deleteWebhookMessage = routify`/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`;
