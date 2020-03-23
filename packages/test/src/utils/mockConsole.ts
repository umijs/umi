type ConsoleFunctionName = {
  [T in keyof Console]: Console[T] extends (...args: any[]) => any ? T : never;
}[keyof Console];

export type MessageStore = any[][] | ((...args: any[]) => void);

export type MessageStoreWithType =
  | [ConsoleFunctionName, ...any[]][]
  | ((name: ConsoleFunctionName, ...args: any[]) => void);

interface ResetMockConsole<T> {
  (): void;
  messages: T;
}

interface MockConsoleFunction<T> {
  (messageStore?: T): ResetMockConsole<T>;
}

interface MockConsole
  extends Record<ConsoleFunctionName, MockConsoleFunction<MessageStore>>,
    MockConsoleFunction<MessageStoreWithType> {}

const consoleFunctionName = Object.keys(console).filter(
  (key): key is ConsoleFunctionName => typeof console[key] === 'function',
);

/**
 * @example
 * function sample() {
 *   console.log('a');
 *   console.warn('b');
 *   return 0;
 * }
 *
 * test('test sample', () => {
 *   const reset = mockConsole();
 *   expect(sample()).toBe(0);
 *   reset();
 *   expect(reset.messages).toEqual([
 *     ['log', 'a'],
 *     ['warn', 'b'],
 *   ]);
 * });
 *
 * test('test sample', () => {
 *   const reset = mockConsole.log();
 *   expect(sample()).toBe(0);
 *   reset();
 *   expect(reset.messages).toEqual([['a']]);
 * });
 */
function mockConsole(
  messageStore: MessageStoreWithType = [],
): ResetMockConsole<MessageStoreWithType> {
  const self = mockConsole as MockConsole;
  const messages = Array.isArray(messageStore) ? messageStore : [];
  const callback = Array.isArray(messageStore) ? null : messageStore;

  const resets = consoleFunctionName.map((name) => {
    return self[name]((...args: any[]) => {
      messages.push([name, ...args]);
      if (callback) callback(name, ...args);
    });
  });

  const reset = () => resets.forEach((fn) => fn());
  reset.messages = messages;
  return reset;
}

for (const name of consoleFunctionName) {
  mockConsole[name] = getMockConsoleFunction(name);
}

export default mockConsole as MockConsole;

function getMockConsoleFunction(
  name: ConsoleFunctionName,
): MockConsoleFunction<MessageStore> {
  return function mockConsoleFunction(messageStore: MessageStore = []) {
    const messages = Array.isArray(messageStore) ? messageStore : [];
    const callback = Array.isArray(messageStore) ? null : messageStore;

    const consoleSpy = jest
      .spyOn(console, name)
      .mockImplementation((...args: any[]) => {
        messages.push(args);
        if (callback) callback(...args);
      });

    const reset = () => consoleSpy.mockRestore();
    reset.messages = messages;
    return reset;
  };
}
