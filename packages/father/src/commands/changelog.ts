import { logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'changelog',
    description: 'changelog',
    fn({ args }) {
      args;
      logger.info(`changelog`);
    },
  });
};
