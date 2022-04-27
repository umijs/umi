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
          include: Joi.array().items(Joi.string()),
        });
      },
    },
    enableBy() {
      // 只有 dev 才默认开启
      if (api.name !== 'dev') {
        return false;
      }
      // 环境变量关闭 mock
      return process.env.MOCK !== 'none';
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
        context.mockData = getMockData({
          cwd: api.cwd,
          mockConfig: api.config.mock || {},
        });
      },
    });
  });

  api.addBeforeMiddlewares(async () => {
    context.mockData = getMockData({
      cwd: api.cwd,
      mockConfig: api.config.mock || {},
    });
    return [
      createMockMiddleware({
        context,
      }),
    ];
  });
}
