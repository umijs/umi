import Logger from './Logger';
import UmiError from './UmiError';

describe('Logger', () => {
  afterEach(() => {
    process.env.DEBUG = '';
  });
  it('profile', (done) => {
    const logger = new Logger('profile');
    const profilerMsg = logger.profile('id1');
    expect(profilerMsg).toMatch(/PROFILE/);
    expect(profilerMsg).toMatch(/profile:id1/);
    setTimeout(() => {
      const profilerEndMsg = logger.profile('id1');
      expect(profilerEndMsg).toMatch(/PROFILE/);
      expect(profilerEndMsg).toMatch(/Completed in .*?m?s$/);
      done();
    });
  });

  it('log', () => {
    const logMockFn = jest.fn();
    const spy = jest.spyOn(global.console, 'log').mockImplementation(logMockFn);
    const logger = new Logger('log');
    logger.log('hello');
    expect(logMockFn).toBeCalled();
    expect(logMockFn).toBeCalledWith('hello');

    logger.log('hello', { hello: 'world' });
    expect(logMockFn).toBeCalledWith('hello', { hello: 'world' });
    spy.mockRestore();
  });

  it('warn', () => {
    const warnMockFn = jest.fn();
    const spy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(warnMockFn);
    const logger = new Logger('warn');
    logger.warn('hello');
    expect(warnMockFn).toBeCalled();
    expect(warnMockFn).toBeCalledWith('hello');

    logger.warn('hello', { hello: 'world' });
    expect(warnMockFn).toBeCalledWith('hello', { hello: 'world' });
    spy.mockRestore();
  });

  it('no debug', () => {
    const debugMockFn = jest.fn();
    const spy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(debugMockFn);
    // jest.spyOn()
    const logger = new Logger('umi-core-debug');
    logger.debug('aaa');
    expect(debugMockFn).not.toBeCalled();
    spy.mockRestore();
  });

  describe('error', () => {
    it('normal error', () => {
      const errorMockFn = jest.fn();
      const spy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(errorMockFn);
      const logger = new Logger('error');
      const normalError = new Error('normal error');
      logger.error(normalError);
      expect(errorMockFn).toBeCalled();
      expect(errorMockFn).toBeCalledWith(normalError);
      spy.mockRestore();
    });

    it('umi error', () => {
      const errorMockFn = jest.fn();
      const spy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(errorMockFn);
      const logger = new Logger('error');
      // Umi Error
      const umiError = new UmiError({
        code: 'ERR_CORE_PLUGIN_RESOLVE_FAILED',
        message: 'test',
      });
      logger.error(umiError);
      expect(errorMockFn).toBeCalled();
      expect(umiError.code).toEqual('ERR_CORE_PLUGIN_RESOLVE_FAILED');
      spy.mockRestore();
    });
  });
});
