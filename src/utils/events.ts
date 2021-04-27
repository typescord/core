/* eslint-disable @typescript-eslint/no-explicit-any */
import { once as $once } from 'events';

interface NodeEventTarget {
	once(event: string | symbol, listener: (...args: any[]) => void): this;
}

export function once(emitter: NodeEventTarget, name: string, signal: AbortSignal): Promise<any> {
	return $once(emitter, name, { signal }).then(([arg]) => arg);
}

export function rejectOnce(emitter: NodeEventTarget, name: string, signal: AbortSignal): Promise<any> {
	return once(emitter, name, signal).then(Promise.reject);
}
