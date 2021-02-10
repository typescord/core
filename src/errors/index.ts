// Heavily inspired by node's `internal/errors` module

import messages, { MessagesKeys } from './messages';
const kCode = Symbol('code');

function makeError(Base: ErrorConstructor) {
  return class TypescordError extends Base {
    public readonly [kCode]: string;
    public readonly name = `${super.name} [${this[kCode]}]`;
    public readonly code = this[kCode];

    public constructor(key: MessagesKeys, ...args: unknown[]) {
      super(description(key, args));

      this[kCode] = key;
    }
  };
}

function description(key: MessagesKeys, ...args: unknown[]): string {
  const message = messages.get(key);

  if (typeof message === 'function') {
    return message(...args);
  }

  if (!args) {
    return message!;
  }

  args.unshift(message);

  return args.join(' ');
}

const _Error = makeError(Error);
const _TypeError = makeError(TypeError);
const _RangeError = makeError(RangeError);

export { _Error as Error, _TypeError as TypeError, _RangeError as RangeError };
