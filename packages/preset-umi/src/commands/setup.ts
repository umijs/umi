import { logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'setup',
    description: 'setup project',
    async fn() {
      // generate tmp files
      logger.info('generate files');
      await api.applyPlugins({
        key: 'onGenerateFiles',
        args: {
          files: null,
          isFirstTime: false,
        },
      });
    },
  });
};
