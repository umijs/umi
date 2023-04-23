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
      schema({ zod }) {
        return zod
          .object({
            exclude: zod
              .array(zod.string())
              .describe('exclude files not parse mock'),
            include: zod.array(zod.string()),
          })
          .deepPartial();
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
    const { include = [] } = mockConfig;
    watch({
      path: ['mock', ...include].map((pattern) =>
        path.resolve(api.cwd, pattern),
      ),
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
