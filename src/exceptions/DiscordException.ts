import { inspect } from 'util';
import type { Response } from 'got';
import type Request from 'got/dist/source/core';

type DiscordAPIRawErrorEntry = { [P in string]: string | number | DiscordAPIRawErrorEntry | DiscordAPIRawErrorEntry[] };

export interface DiscordAPIRawError {
	code: number;
	message: string;
	errors: Record<string, DiscordAPIRawErrorEntry>;
}

export class DiscordException extends Error {
	public readonly code: number;
	public readonly errors: DiscordAPIRawError['errors'] & { [inspect.custom](): string };

	public constructor(
		rawError: DiscordAPIRawError,
		public readonly response: Response,
		public readonly request: Request,
	) {
		super(rawError.message);
		this.code = rawError.code;
		this.errors = {
			...rawError.errors,
			[inspect.custom]() {
				// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
				const { [inspect.custom]: _, ...errors } = this;
				return inspect(errors, false, Infinity, true);
			},
		};
		this.name = `DiscordException [${this.code}]`;
		Error.captureStackTrace(this, DiscordException);
	}
}
