// Inspired by https://github.com/discordjs/discord.js/blob/master/src/errors/DJSError.js

import { messages, MessagesKeys } from './messages';

function description(key: MessagesKeys, ...args: unknown[]): string {
	const message = messages.get(key);

	if (typeof message === 'function') {
		return message(...args);
	}

	if (args.length === 0) {
		return message!;
	}

	return `${message} ${args.join(' ')}`;
}

export class Exception extends Error {
	public readonly code;
	public readonly name;

	public constructor(key: MessagesKeys, ...args: unknown[]) {
		super(description(key, args));
		this.code = key;
		this.name = `${super.name} [${this.code}]`;
	}
}
