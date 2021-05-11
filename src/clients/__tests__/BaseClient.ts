import { promisify } from 'util';
import { setTimeout as _setTimeout, setImmediate as _setImmediate } from 'timers';
import { BaseClient } from '../BaseClient';

const setTimeout = promisify(_setTimeout);
const setImmediate = promisify(_setImmediate);

// only for test
class TestClient extends BaseClient {
	public constructor() {
		super('Bot', { sweepInterval: 0 });
	}
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

describe(BaseClient.prototype.setImmediate, () => {
	it('should fire with the right arguments', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setImmediate(handler, 1, '2', [3, 4]);

		await setImmediate();
		expect(handler).toHaveBeenCalled();
	});

	it('should not fire when the Client is destroyed', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setImmediate(handler, 1, '2', [3, 4]);
		client.destroy();

		expect(handler).not.toHaveBeenCalled();
	});

	it('should be cleared correctly', () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.clearImmediate(client.setImmediate(handler, 1, '2', [3, 4]));

		expect(handler).not.toHaveBeenCalled();
		// @ts-expect-error i don't want to type this...
		expect(client[Object.getOwnPropertySymbols(client)[1]].size).toStrictEqual(0);
	});
});

describe(BaseClient.prototype.setTimeout, () => {
	it('should fire with the right arguments', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setTimeout(handler, 100, 1, '2', [3, 4]);

		await setTimeout(150);
		expect(handler).toHaveBeenCalledWith(1, '2', [3, 4]);
		client.destroy();
	});

	it('should not fire when the Client is destroyed', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setTimeout(handler, 100, 1, '2', [3, 4]);
		client.destroy();

		await setTimeout(150);
		expect(handler).not.toHaveBeenCalled();
	});

	it('should be cleared correctly', () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.clearTimeout(client.setTimeout(handler, 100, '2', [3, 4]));

		expect(handler).not.toHaveBeenCalled();
		// @ts-expect-error i don't want to type this...
		expect(client[Object.getOwnPropertySymbols(client)[2]].size).toStrictEqual(0);
	});
});

describe(BaseClient.prototype.setInterval, () => {
	it('should fire 3 times with the right arguments', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setInterval(handler, 100, 1, '2', [3, 4]);

		await setTimeout(350);
		expect(handler).toHaveBeenCalledTimes(3);
		expect(handler).toHaveBeenCalledWith(1, '2', [3, 4]);
		client.destroy();
	});

	it('should not fire when the Client is destroyed', async () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.setInterval(handler, 100, 1, '2', [3, 4]);
		client.destroy();

		await setTimeout(150);
		expect(handler).not.toHaveBeenCalled();
	});

	it('should be cleared correctly', () => {
		const client = new TestClient();
		const handler = jest.fn();

		client.clearInterval(client.setInterval(handler, 1000, '2', [3, 4]));

		expect(handler).not.toHaveBeenCalled();
		// @ts-expect-error i don't want to type this...
		expect(client[Object.getOwnPropertySymbols(client)[3]].size).toStrictEqual(0);
	});
});

describe(BaseClient.prototype.destroy, () => {
	it('should clear all timers', () => {
		const client = new TestClient();
		client.setImmediate(noop);
		client.setTimeout(noop, 10_000);
		client.setInterval(noop, 10_000);

		client.destroy();

		expect(
			Object.getOwnPropertySymbols(client)
				.slice(1)
				// @ts-expect-error i don't want to type this...
				.map((symbol) => client[symbol].size),
		).toStrictEqual([0, 0, 0]);
	});
});
