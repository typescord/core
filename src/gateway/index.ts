import { TextDecoder } from 'util';
import { Packable } from '@typescord/erlpack';
import ws from 'ws';

// eslint-disable-next-line unicorn/no-useless-undefined
const erlpack = await import('@typescord/erlpack').catch(() => undefined);

export const encoding = erlpack ? 'etf' : 'json';

export function pack(data: Packable): string | Buffer {
	return erlpack ? erlpack.pack(data) : JSON.stringify(data);
}

export function unpack<T>(data: ws.Data, json = false): T {
	if (!erlpack || json) {
		const { decode } = new TextDecoder();
		let decodedData = '';

		if (data instanceof Buffer || data instanceof ArrayBuffer) {
			decodedData = decode(data);
		} else if (Array.isArray(data)) {
			for (const buffer of data) {
				decodedData += decode(buffer);
			}
		} else {
			decodedData = data;
		}

		return (JSON.parse(decodedData) as unknown) as T;
	}

	let toUnpack;

	if (typeof data === 'string') {
		toUnpack = Buffer.from(data);
	} else if (data instanceof ArrayBuffer) {
		toUnpack = new Uint8Array(data);
	} else if (Array.isArray(data)) {
		toUnpack = Buffer.concat(data);
	} else {
		toUnpack = data;
	}

	return (erlpack.unpack(toUnpack) as unknown) as T;
}
