import { IApi } from '../../types';
import createMiddleware from './createMiddleware';
import { getMockData, IGetMockDataResult } from './utils';

export default function (api: IApi) {
  const { cwd, userConfig } = api;

  api.describe({
    key: 'mock',
    config: {
      schema(Joi) {
        return Joi.object().keys({
          exclude: Joi.array()
            .items(Joi.string())
            .description('exclude files not parse mock'),
        });
      },
    },
  });

  if (process.env.MOCK === 'none') {
    return;
  }

  const ignore = [
    // ignore mock files under node_modules
    'node_modules/**',
    ...(userConfig?.mock?.exclude || []),
  ];

  api.addBeforeMiddlewares(async () => {
    const mockResult = getMockData({
      cwd,
      ignore,
    });

    //TODO: check whether conflict when starting ？
    // await checkConflictPaths(mockResult);

    const { middleware } = createMiddleware({
      ...mockResult,
      updateMockData: async () => {
        const result = getMockData({
          cwd,
          ignore,
        }) as IGetMockDataResult;
        //TODO: check whether conflict when updating ？
        // await checkConflictPaths(result);
        return result;
      },
    });
    return [middleware];
  });
}
