// supported but not yet typed (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/50281)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore TODO: remove these comments when PR is merged
import { setTimeout, setImmediate } from 'timers/promises';
import { Error } from '../../errors';
import { BaseClient } from '../BaseClient';

// only for test
class TestClient extends BaseClient {
  public constructor() {
    super();
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

  it('should throw a error if the Client is destroyed', () => {
    const client = new TestClient();
    client.destroy();

    expect(() => client.setImmediate(noop)).toThrowError(new Error('CLIENT_DESTROYED_TIMER'));
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

  it('should throw a error if the Client is destroyed', () => {
    const client = new TestClient();
    client.destroy();

    expect(() => client.setTimeout(noop, 100)).toThrowError(new Error('CLIENT_DESTROYED_TIMER'));
  });
});

describe(BaseClient.prototype.setInterval, () => {
  it('should fire n times with the right arguments', async () => {
    const client = new TestClient();
    const handler = jest.fn();

    client.setInterval(handler, 100, 1, '2', [3, 4]);

    await setTimeout(350);
    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenCalledWith(1, '2', [3, 4]);
    client.destroy();
  });

  it('should not fire Interval when the Client is destroyed', async () => {
    const client = new TestClient();
    const handler = jest.fn();

    client.setInterval(handler, 100, 1, '2', [3, 4]);
    client.destroy();

    await setTimeout(150);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should throw a error if the Client is destroyed', () => {
    const client = new TestClient();
    client.destroy();

    expect(() => client.setInterval(noop, 100)).toThrowError(new Error('CLIENT_DESTROYED_TIMER'));
  });
});

describe(BaseClient.prototype.destroy, () => {
  it('should throw a error if the client is already destroyed', () => {
    const client = new TestClient();
    client.destroy();

    expect(() => client.destroy()).toThrowError(new Error('CLIENT_ALREADY_DESTROYED'));
  });
});
