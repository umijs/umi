import { shouldSkipUnmountForKeepAlive } from '../../libs/qiankun/master/shouldSkipUnmountForKeepAlive';

describe('shouldSkipUnmountForKeepAlive', () => {
  test('without keepAlive (autoUnmount default/true): never skip — name switch must unmount', () => {
    expect(
      shouldSkipUnmountForKeepAlive({
        autoUnmount: true,
        containerStillInDocument: true,
        microAppReplaced: false,
      }),
    ).toBe(false);

    expect(
      shouldSkipUnmountForKeepAlive({
        containerStillInDocument: true,
        microAppReplaced: true,
      }),
    ).toBe(false);
  });

  test('keepAlive + name changed (new microApp on ref): never skip', () => {
    expect(
      shouldSkipUnmountForKeepAlive({
        autoUnmount: false,
        containerStillInDocument: true,
        microAppReplaced: true,
      }),
    ).toBe(false);
  });

  test('keepAlive + same instance + container still under body: skip to retain cache', () => {
    expect(
      shouldSkipUnmountForKeepAlive({
        autoUnmount: false,
        containerStillInDocument: true,
        microAppReplaced: false,
      }),
    ).toBe(true);
  });

  test('keepAlive + container removed from document: unmount normally', () => {
    expect(
      shouldSkipUnmountForKeepAlive({
        autoUnmount: false,
        containerStillInDocument: false,
        microAppReplaced: false,
      }),
    ).toBe(false);
  });
});
