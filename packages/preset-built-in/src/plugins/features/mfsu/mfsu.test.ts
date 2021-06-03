import { join } from 'path';
import { IApi } from 'umi';
import {
  getDeps,
  getMfsuPath,
  getIncludeDeps,
  getExcludeDeps,
  checkConfig,
} from './mfsu';

xtest('check config', () => {
  // @ts-ignore
  const api: IApi = {
    config: {
      webpack5: {},
    },
  };
  expect(checkConfig(api)).toThrowError();
});

xtest('functions: get mfsu path', () => {
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

xtest('functions: get include dependencies', () => {
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

xtest('functions: get exclude dependencies', () => {
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
