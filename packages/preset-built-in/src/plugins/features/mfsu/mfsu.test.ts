import { winPath } from '@umijs/utils';
import { IApi } from 'umi';
import { getMfsuPath } from './mfsu';

test('functions: get mfsu path', () => {
  // @ts-ignore
  let api: IApi = {
    config: {
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
