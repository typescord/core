import { Packable } from '@typescord/erlpack';

//eslint-disable-next-line @typescript-eslint/no-empty-function
const erlpack = await import('@typescord/erlpack').catch(() => {});

export const encoding = erlpack ? 'etf' : 'json';

export function pack(data: Packable): Buffer | string {
	return erlpack ? erlpack.pack(data) : JSON.stringify(data);
}

export function unpack(packet: Buffer | string): any {
	if (erlpack) {
		return erlpack.unpack(Buffer.from(packet));
	}

	return JSON.parse(typeof packet === 'string' ? packet : packet.toString('utf8'));
}
