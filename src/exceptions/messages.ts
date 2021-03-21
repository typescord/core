const $messages = {
	TOKEN_MISSING: 'The token is missing.',
} as const;

export type MessagesKeys = keyof typeof $messages;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages = new Map<MessagesKeys, string | ((...args: any[]) => string)>();

for (const [key, value] of Object.entries($messages)) {
	messages.set(key as MessagesKeys, value);
}

export { messages };