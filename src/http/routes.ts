import type * as d from 'discord-api-types/rest/v8';
import { StaticRoute, routify as r } from './routing';

export const gatewayBot = 'gateway/bot' as StaticRoute<d.RESTGetAPIGatewayBotResult>;
export const user = r<d.RESTGetAPIUserResult, undefined, ['userId']>`users/${'userId'}`;
export const guildMember = r<
	d.RESTGetAPIGuildMemberResult,
	undefined,
	['guildId', 'userId']
>`guilds/${'guildId'}/members/${'userId'}`;
