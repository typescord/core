// eslint-disable-next-line @typescript-eslint/no-var-requires
const { homepage, version } = require('../package') as Record<string, string>;

export { version };
export const USER_AGENT = `DiscordBot (${homepage.split('#')[0]}, ${version})`;

export const WSEvents = {
	CLOSE: 'close',
	DESTROYED: 'destroyed',
	INVALID_SESSION: 'invalidSession',
	READY: 'ready',
	RESUMED: 'resumed',
};
