import { logger } from '@umijs/utils';
import path from 'path';
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

  function updateMockData(onSuccess?: Function) {
    try {
      context.mockData = getMockData({
        cwd: api.cwd,
        mockConfig: api.config.mock || {},
      });
      onSuccess?.();
    } catch (e) {
      logger.error(e);
    }
  }

  api.onStart(() => {
    const mockConfig = api.config.mock || {};
    const { include = [], exclude = [] } = mockConfig;
    watch({
      path: ['mock', ...include].map((pattern) =>
        path.resolve(api.cwd, pattern),
      ),
      watchOpts: {
        ignored: exclude.map((pattern: string) =>
          path.resolve(api.cwd, pattern),
        ),
      },
      addToUnWatches: true,
      onChange: () => {
        updateMockData(() => {
          logger.info('Mock file update successful');
        });
      },
    });
  });

  api.addBeforeMiddlewares(async () => {
    updateMockData();
    return [
      createMockMiddleware({
        context,
      }),
    ];
  });
}
