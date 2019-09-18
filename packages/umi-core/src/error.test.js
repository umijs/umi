import { UmiError, printUmiError } from './error';

test('ERR_CORE_PLUGIN_RESOLVE_FAILED', () => {
  const error = new UmiError({
    code: 'ERR_CORE_PLUGIN_RESOLVE_FAILED',
    message: "Plugin test can't be resolved",
  });
  expect(error.code).toEqual('ERR_CORE_PLUGIN_RESOLVE_FAILED');
  expect(error.message).toEqual("Plugin test can't be resolved");
});

test('ModuleNotFoundError', () => {
  const webpackError = new Error('ModuleNotFoundError');
  const error = new UmiError({
    message: webpackError.message,
    context: {
      err: webpackError,
      stats: {
        compilation: {
          errors: [{ name: 'ModuleNotFoundError' }],
        },
      },
      dll: true,
    },
  });
  expect(error.code).toEqual('ERR_WEBPACK_DLL_MODULE_NOT_FOUND');
});

test('ERR_WEBPACK_MODULE_NOT_FOUND', () => {
  const webpackError = new Error('ModuleNotFoundError');
  const error = new UmiError({
    message: webpackError.message,
    context: {
      err: webpackError,
      stats: {
        compilation: {
          errors: [{ name: 'ModuleNotFoundError' }],
        },
      },
      dll: false,
    },
  });
  expect(error.code).toEqual('ERR_WEBPACK_MODULE_NOT_FOUND');
  printUmiError(error);
});

test('not UmiError instance', () => {
  printUmiError(new Error('foooo'));
});
