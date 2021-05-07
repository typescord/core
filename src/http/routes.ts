import type * as d from 'discord-api-types/rest/v8';
import type { StaticRoute } from './routing';

export const gatewayBot = 'gateway/bot' as StaticRoute<d.RESTGetAPIGatewayBotResult>;
