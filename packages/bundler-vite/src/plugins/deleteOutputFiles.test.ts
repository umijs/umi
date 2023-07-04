import deleteOutputFiles from './deleteOutputFiles';

test('test windows', async () => {
  const files = [
    'a\\b\\c',
    'd\\e\\f',
    'node_modules\\.tmp\\.bundler-vite-entry\\umi.html',
  ];
  const beforeDelete = jest.fn();
  const plugin = deleteOutputFiles(files, beforeDelete) as any;
  const output = {
    'a/b/c': {
      fileName: 'a/b/c',
    },
    'd/e/f': {
      fileName: 'd/e/f',
    },
    'node_modules/.tmp/.bundler-vite-entry/umi.html': {
      fileName: 'node_modules/.tmp/.bundler-vite-entry/umi.html',
    },
  };
  plugin.generateBundle?.({}, output);
  expect(beforeDelete).toBeCalledTimes(3);
  expect(output).toEqual({});
});

test('test mac', async () => {
  const files = [
    'a/b/c',
    'd/e/f',
    'node_modules/.tmp/.bundler-vite-entry/umi.html',
  ];
  const beforeDelete = jest.fn();
  const plugin = deleteOutputFiles(files, beforeDelete) as any;
  const output = {
    'a/b/c': {
      fileName: 'a/b/c',
    },
    'd/e/f': {
      fileName: 'd/e/f',
    },
    'node_modules/.tmp/.bundler-vite-entry/umi.html': {
      fileName: 'node_modules/.tmp/.bundler-vite-entry/umi.html',
    },
  };
  plugin.generateBundle?.({}, output);
  expect(beforeDelete).toBeCalledTimes(3);
  expect(output).toEqual({});
});
