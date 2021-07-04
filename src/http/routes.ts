import type * as d from 'discord-api-types/rest/v8';
import { StaticRoute } from './routing';

// TODO: simplify this when TypeScript will CORRECTLY infer some types (https://github.com/microsoft/TypeScript/issues/10571)

// Gateway
export const gateway = '/gateway' as StaticRoute<{ get: { r: d.RESTGetAPIGatewayResult } }>;
export const gatewayBot = '/gateway/bot' as StaticRoute<{ get: { r: d.RESTGetAPIGatewayBotResult } }>;
