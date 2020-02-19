import { IApi } from '@umijs/types';
import createMiddleware from './createMiddleware';
import { getMockData, IGetMockDataResult } from './utils';

export default function(api: IApi) {
  const { cwd, userConfig } = api;

  api.describe({
    key: 'mock',
    config: {
      schema(joi) {
        return joi.object().keys({
          exclude: joi
            .array()
            .items(joi.string())
            .optional(),
        });
      },
    },
  });

  if (process.env.MOCK === 'none') {
    return;
  }

  const registerBabel = (paths: string[]): void => {
    // babel compiler
    api.babelRegister.setOnlyMap({
      key: 'mock',
      value: paths,
    });
  };

  const ignore = userConfig?.mock?.exclude;

  // get all mock paths
  const mockResult = getMockData({
    cwd,
    ignore,
    registerBabel,
  });

  // disable when not exist mock dir
  if (!mockResult) {
    return;
  }

  api.addBeforeMiddewares(() => {
    const { middleware } = createMiddleware({
      ...mockResult,
      updateMockData: () => {
        const result = getMockData({
          cwd,
          ignore,
          registerBabel,
        }) as IGetMockDataResult;
        return result;
      },
    });
    return middleware;
  });
}
