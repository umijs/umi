import { IApi } from '../../types';
import { createMockMiddleware } from './createMockMiddleware';
import { getMockData } from './getMockData';

export default function (api: IApi) {
  const { cwd } = api;

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

  api.addBeforeMiddlewares(async () => {
    const mockData = getMockData({
      cwd,
    });
    // context for update mockData
    const context = { mockData };
    return [
      createMockMiddleware({
        context,
      }),
    ];
  });
}
