/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter, once as $once } from 'events';

declare module 'events' {
	// eslint-disable-next-line @typescript-eslint/no-shadow
	class EventEmitter {
		public static once(emitter: EventEmitter, event: string | symbol, options: { signal: any }): Promise<unknown[]>;
	}
}

export function once(emitter: EventEmitter, name: string, signal: unknown): Promise<any> {
	return $once(emitter, name, { signal }).then(([arg]) => arg);
}

export function rejectOnce(emitter: EventEmitter, name: string, signal: unknown): Promise<any> {
	return once(emitter, name, signal).then(Promise.reject);
}

export enum Events {
	CLIENT_READY = 'ready',
	WEBSOCKET_DISCONNECTING = 'websocketDisconnecting',
	WEBSOCKET_ERROR = 'websocketError',
	WEBSOCKET_READY = 'websocketReady',
	WEBSOCKET_RECONNECTING = 'websocketReconnecting',
	WEBSOCKET_RECONNECTINGf = 'websocketReconnecting',
}
