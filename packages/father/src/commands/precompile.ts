import { logger } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'precompile',
    description: 'precompile',
    fn({ args }) {
      args;
      logger.info(`precompile`);
    },
  });
};
