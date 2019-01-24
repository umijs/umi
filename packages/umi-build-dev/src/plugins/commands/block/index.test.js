import blockPlugin from './index';

describe('init block plugin right', () => {
  const commandFn = jest.fn();
  const mockApi = {
    log: () => {},
    paths: {},
    registerCommand: cmd => {
      commandFn(cmd);
    },
  };

  it('get right command name', () => {
    blockPlugin(mockApi);
    expect(commandFn).toBeCalledWith('block');
  });
});
