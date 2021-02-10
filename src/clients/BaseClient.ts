import { EventEmitter } from 'events';
import { Error } from '../errors';

export interface BaseClientOptions {
  token?: string;
}

export class BaseClient extends EventEmitter {
  private immediates = new Set<NodeJS.Immediate>();
  private timeouts = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();
  private destroyed = false;

  protected constructor(public readonly options: BaseClientOptions = {}) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setImmediate<T extends any[]>(callback: (...args: T) => void, ...args: T): NodeJS.Immediate {
    if (this.destroyed) {
      throw new Error('CLIENT_DESTROYED_TIMER');
    }

    const immediate = setImmediate(() => {
      this.immediates.delete(immediate);

      callback(...args);
    });

    this.immediates.add(immediate);

    return immediate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setTimeout<T extends any[]>(callback: (...args: T) => void, ms: number, ...args: T): NodeJS.Timeout {
    if (this.destroyed) {
      throw new Error('CLIENT_DESTROYED_TIMER');
    }

    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);

      callback(...args);
    }, ms);

    this.timeouts.add(timeout);

    return timeout;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setInterval<T extends any[]>(callback: (...args: T) => void, ms: number, ...args: T): NodeJS.Timeout {
    if (this.destroyed) {
      throw new Error('CLIENT_DESTROYED_TIMER');
    }

    const interval = setInterval(callback, ms, ...args);

    this.intervals.add(interval);

    return interval;
  }

  public destroy(): void {
    if (this.destroyed) {
      throw new Error('CLIENT_ALREADY_DESTROYED');
    }

    this.destroyed = true;

    this.intervals.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
    this.immediates.forEach(clearImmediate);

    this.intervals.clear();
    this.timeouts.clear();
    this.immediates.clear();
  }
}
