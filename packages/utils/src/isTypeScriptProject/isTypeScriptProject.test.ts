import isTypeScriptProject from './isTypeScriptProject';
import { IApi } from '@umijs/types';

test('is-javascript', async () => {
  const api = {
    service: {
      configInstance: {
        configFile: 'config/config.js',
      },
    },
  } as IApi;
  expect(isTypeScriptProject(api)).toEqual(false);
});

test('is-typescript', async () => {
  const api = {
    service: {
      configInstance: {
        configFile: 'config/config.ts',
      },
    },
  } as IApi;
  expect(isTypeScriptProject(api)).toEqual(true);
});
