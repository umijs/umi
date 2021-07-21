import { winPath } from '@umijs/utils';
import { IApi } from 'umi';
import { getMfsuPath, normalizeReqPath } from './mfsu';

test('functions: get mfsu path', () => {
  // @ts-ignore
  let api: IApi = {
    userConfig: {
      mfsu: {
        development: {
          output: './foo/bar',
        },
        production: {
          output: './xxx/yyy/zzz',
        },
      },
    },
    cwd: '/work/',
  };

  expect(winPath(getMfsuPath(api, { mode: 'development' }))).toEqual(
    '/work/foo/bar',
  );
  expect(winPath(getMfsuPath(api, { mode: 'production' }))).toEqual(
    '/work/xxx/yyy/zzz',
  );
});

test('normalizeReqPath', () => {
  // publicPath should be normalized as '/'
  expect(normalizeReqPath('/', '/mf-va_xxxxxxxxxxx.js')).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/',
    fileRelativePath: 'mf-va_xxxxxxxxxxx.js',
  });

  expect(normalizeReqPath('./', '/mf-dep_xxxxxx.js')).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/',
    fileRelativePath: 'mf-dep_xxxxxx.js',
  });

  expect(normalizeReqPath('../../../', '/mf-dep_xxxxxx.js')).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/',
    fileRelativePath: 'mf-dep_xxxxxx.js',
  });

  // not mfsu asserts
  expect(
    normalizeReqPath('../../../', '/a/b/c/mf-dep_xxxxxx.js'),
  ).toStrictEqual({
    isMfAssets: false,
    normalPublicPath: '/',
    fileRelativePath: 'a/b/c/mf-dep_xxxxxx.js',
  });

  // publicPath should be normalized as '/xxx/xxx/'
  expect(
    normalizeReqPath('./public_path/', '/public_path/mf-dep_xxxxxx.js'),
  ).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/public_path/',
    fileRelativePath: 'mf-dep_xxxxxx.js',
  });

  expect(
    normalizeReqPath('../../public_path/', '/public_path/mf-dep_xxxxxx.js'),
  ).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/public_path/',
    fileRelativePath: 'mf-dep_xxxxxx.js',
  });

  expect(
    normalizeReqPath(
      './public_path/a/b/c/',
      '/public_path/a/b/c/mf-static/cfile.html',
    ),
  ).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/public_path/a/b/c/',
    fileRelativePath: 'mf-static/cfile.html',
  });

  // not mfsu asserts
  expect(
    normalizeReqPath('./public_path/', '/public_path/a/b/c/mf-dep_xxxxxx.js'),
  ).toStrictEqual({
    isMfAssets: false,
    normalPublicPath: '/public_path/',
    fileRelativePath: 'a/b/c/mf-dep_xxxxxx.js',
  });

  // publicPath with hosts
  expect(
    normalizeReqPath(
      'http://10.0.0.111/public_path/a/b/c/',
      '/public_path/a/b/c/mf-static/cfile.html',
    ),
  ).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/public_path/a/b/c/',
    fileRelativePath: 'mf-static/cfile.html',
  });

  expect(
    normalizeReqPath(
      'http://umijs.org/public_path/a/b/c/',
      '/public_path/a/b/c/mf-static/cfile.html',
    ),
  ).toStrictEqual({
    isMfAssets: true,
    normalPublicPath: '/public_path/a/b/c/',
    fileRelativePath: 'mf-static/cfile.html',
  });

  // not mfsu asserts
  expect(
    normalizeReqPath('http://umijs.org/', '/a/b/c/mf-static/cfile.html'),
  ).toStrictEqual({
    isMfAssets: false,
    normalPublicPath: '/',
    fileRelativePath: 'a/b/c/mf-static/cfile.html',
  });
});
