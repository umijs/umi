import { IApi } from 'umi';
import { getExcludeDeps, getIncludeDeps, getMfsuPath } from './mfsu';

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

  expect(getMfsuPath(api, { mode: 'development' })).toEqual('/work/foo/bar');
  expect(getMfsuPath(api, { mode: 'production' })).toEqual('/work/xxx/yyy/zzz');
});

test('functions: get include dependencies', () => {
  // @ts-ignore
  let api: IApi = {
    userConfig: {
      mfsu: {
        includes: ['aaaaa', 'bbbbb/ccccc'],
      },
    },
  };
  expect(getIncludeDeps(api)).toEqual(['aaaaa', 'bbbbb/ccccc']);
});

test('functions: get exclude dependencies', () => {
  // @ts-ignore
  let api: IApi = {
    userConfig: {
      mfsu: {
        excludes: ['xxxx'],
      },
    },
  };
  expect(getExcludeDeps(api)).toEqual(['umi', 'xxxx']);
});
