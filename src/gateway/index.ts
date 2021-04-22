import { Packable } from '@typescord/erlpack';

const erlpack = require('@typescord/erlpack');

export const encoding = erlpack ? 'etf' : 'json';

export function pack(data: Packable): Buffer | string {
	return erlpack ? erlpack.pack(data) : JSON.stringify(data);
}

export function unpack(packet: Buffer | string) {
	if (erlpack) {
		return erlpack.unpack(Buffer.from(packet));
	}

	return JSON.parse(typeof packet === 'string' ? packet : packet.toString('utf8'));
}
