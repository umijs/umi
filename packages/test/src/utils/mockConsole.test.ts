import mockConsole, { MessageStore, MessageStoreWithType } from './mockConsole';

test('test mockConsole', () => {
  const reset = mockConsole();
  console.log('a', 'b');
  console.warn('c', 'd');
  console.log('e');
  reset();
  expect(reset.messages).toEqual([
    ['log', 'a', 'b'],
    ['warn', 'c', 'd'],
    ['log', 'e'],
  ]);
});

test('test mockConsole with custom message store', () => {
  const messageStore: MessageStoreWithType = [];
  const reset = mockConsole(messageStore);
  console.log('a');
  reset();
  expect(messageStore).toEqual([['log', 'a']]);
});

test('test mockConsole with callback', () => {
  const outerMessageStore: MessageStoreWithType = [];
  const reset = mockConsole((...input) => outerMessageStore.push(input));
  console.log('a');
  reset();
  expect(outerMessageStore).toEqual([['log', 'a']]);
});

test('test mockConsole.xxx', () => {
  const resetLog = mockConsole.log();
  const resetWarn = mockConsole.warn();
  console.log('a', 'b');
  console.warn('c', 'd');
  console.log('e');
  resetLog();
  resetWarn();
  expect(resetLog.messages).toEqual([['a', 'b'], ['e']]);
  expect(resetWarn.messages).toEqual([['c', 'd']]);
});

test('test mockConsole.xxx with custom message store', () => {
  const messageStore: MessageStore = [];
  const reset = mockConsole.log(messageStore);
  console.log('a');
  reset();
  expect(messageStore).toEqual([['a']]);
});

test('test mockConsole.xxx with callback', () => {
  const outerMessageStore: MessageStore = [];
  const reset = mockConsole.log((...input) => outerMessageStore.push(input));
  console.log('a');
  reset();
  expect(outerMessageStore).toEqual([['a']]);
});
