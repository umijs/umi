import { watch } from '../../commands/dev/watch';
import { IApi } from '../../types';
import { createMockMiddleware } from './createMockMiddleware';
import { getMockData } from './getMockData';

export default function (api: IApi) {
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
    enableBy({ env }) {
      return env === 'development';
    },
  });

  // context for update mockData
  const context: any = {
    mockData: null,
  };

  api.onStart(() => {
    watch({
      path: `${api.cwd}/mock`,
      addToUnWatches: true,
      onChange: () => {
        context.mockData = getMockData({ cwd: api.cwd });
      },
    });
  });

  api.addBeforeMiddlewares(async () => {
    context.mockData = getMockData({ cwd: api.cwd });
    return [
      createMockMiddleware({
        context,
      }),
    ];
  });
}
