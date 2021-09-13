import { checkMatch } from './checkMatch';

test('normal', () => {
  expect(
    checkMatch({
      value: 'foo',
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf/foo' });
});

test('unMatch libs', () => {
  expect(
    checkMatch({
      value: 'foo',
      opts: {
        unMatchLibs: ['foo'],
      },
    }).isMatch,
  ).toEqual(false);
});

test('start with mf/', () => {
  expect(
    checkMatch({
      value: 'mf/foo',
    }).isMatch,
  ).toEqual(false);
});

test('babel/svgr-webpack', () => {
  expect(
    checkMatch({
      value: 'test/babel/svgr-webpack/x',
    }).isMatch,
  ).toEqual(false);
});

test('webpack loader', () => {
  expect(
    checkMatch({
      value: '!!dumi-raw-code-loader!/foo',
    }).isMatch,
  ).toEqual(false);
});

test('external', () => {
  expect(
    checkMatch({
      value: 'foo',
      opts: {
        externals: {
          foo: 'window.Foo',
        },
      },
    }).isMatch,
  ).toEqual(false);
});

test('relative path', () => {
  expect(
    checkMatch({
      value: './foo',
    }).isMatch,
  ).toEqual(false);
});

test('absolute path within node_modules', () => {
  expect(
    checkMatch({
      value: '/foo/node_modules/bar',
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf//foo/node_modules/bar' });
});

test('absolute path within umi/packages', () => {
  expect(
    checkMatch({
      value: '/foo/umi-next/packages/bar',
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf//foo/umi-next/packages/bar' });
});

test('alias', () => {
  expect(
    checkMatch({
      value: 'foo/bar',
      opts: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf/bar/bar' });
});

test('alias with node_modules', () => {
  expect(
    checkMatch({
      value: 'foo/bar',
      opts: {
        alias: {
          foo: 'bar/node_modules/haha',
        },
      },
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf/bar/node_modules/haha/bar' });
});

test('alias with absolute path without node_modules', () => {
  expect(
    checkMatch({
      value: 'foo/bar',
      opts: {
        alias: {
          foo: '/foo',
        },
      },
    }),
  ).toEqual({ isMatch: false, replaceValue: '' });
});

test('exportAll', () => {
  expect(
    checkMatch({
      value: 'foo',
      opts: {},
      isExportAll: true,
    }),
  ).toEqual({ isMatch: false, replaceValue: '' });
});

test('exportAll + exportAllMembers', () => {
  expect(
    checkMatch({
      value: 'foo',
      opts: {
        exportAllMembers: {
          foo: ['foo'],
        },
      },
      isExportAll: true,
    }),
  ).toEqual({ isMatch: true, replaceValue: 'mf/foo' });
});

test('alias with endless loop', () => {
  expect(() => {
    checkMatch({
      value: 'foo/bar',
      opts: {
        alias: {
          foo: 'foo/bar',
        },
      },
    });
  }).toThrow(/endless loop detected/);
});
