import { logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'release',
    description: 'release',
    fn({ args }) {
      args;
      logger.info(`release`);
    },
  });
};
