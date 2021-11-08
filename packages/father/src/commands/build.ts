import { logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'build',
    description: 'build',
    fn({ args }) {
      args;
      console.log(api.config);
      logger.info(`build`);
    },
  });
};
