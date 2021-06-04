import { IApi } from '@umijs/types';
import { parseRequireDeps } from '@umijs/utils';
import createMiddleware from './createMiddleware';
import { getConflictPaths, getMockData, IGetMockDataResult } from './utils';

export default function (api: IApi) {
  const { cwd, userConfig } = api;

  api.describe({
    key: 'mock',
    config: {
      schema(joi) {
        return joi.object().keys({
          exclude: joi
            .array()
            .items(joi.string())
            .description('exclude files not parse mock'),
        });
      },
    },
  });

  if (process.env.MOCK === 'none') {
    return;
  }

  const registerBabel = (paths: string[]): void => {
    // support
    // clear require cache and set babel register
    const requireDeps = paths.reduce((memo: string[], file) => {
      memo = memo.concat(parseRequireDeps(file));
      return memo;
    }, []);
    requireDeps.forEach((f) => {
      if (require.cache[f]) {
        delete require.cache[f];
      }
    });
    api.babelRegister.setOnlyMap({
      key: 'mock',
      value: [...paths, ...requireDeps],
    });
  };

  const ignore = [
    // ignore mock files under node_modules
    'node_modules/**',
    ...(userConfig?.mock?.exclude || []),
  ];

  api.addBeforeMiddlewares(async () => {
    const checkConflictPaths = async (
      mockRes: IGetMockDataResult,
    ): Promise<void> => {
      const routes = await api.getRoutes();
      const conflictPaths = getConflictPaths({
        routes,
        mockData: mockRes.mockData,
      });
      if (conflictPaths?.length > 0) {
        // [WARN] for conflict path with routes config
        api.logger.warn(
          'mock paths',
          conflictPaths.map((conflictPath) => conflictPath.path),
          'conflicts with route config.',
        );
      }
    };
    const mockResult = getMockData({
      cwd,
      ignore,
      registerBabel,
    });

    // check whether conflict when starting
    await checkConflictPaths(mockResult);

    const { middleware } = createMiddleware({
      ...mockResult,
      updateMockData: async () => {
        const result = getMockData({
          cwd,
          ignore,
          registerBabel,
        }) as IGetMockDataResult;
        // check whether conflict when updating
        await checkConflictPaths(result);
        return result;
      },
    });
    return middleware;
  });
}
