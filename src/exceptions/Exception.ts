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
	public constructor(public readonly code: MessagesKeys, ...args: unknown[]) {
		super(description(code, args));
		this.name = `Exception [${this.code}]`;
		Error.captureStackTrace(this, Exception);
	}
}
