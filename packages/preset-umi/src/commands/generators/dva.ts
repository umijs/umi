import { GeneratorType } from '@umijs/core';
import { fsExtra, logger } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper, getUmiJsPlugin } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:dva',
  });

  api.registerGenerator({
    key: 'dva',
    name: 'Enable Dva',
    description: 'Configuration, Dependencies, and Model Files for Dva',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !api.config.dva;
    },
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        '@umijs/plugins': getUmiJsPlugin(),
      });

      h.setUmirc('dva', {});
      h.appendInternalPlugin('@umijs/plugins/dist/dva');
      logger.info('Update config file');

      // example model
      const modelsPath = join(api.paths.absSrcPath, 'models');
      fsExtra.outputFileSync(
        join(modelsPath, 'count.ts'),
        `
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default {
  namespace: 'count',
  state: {
    num: 0,
  },
  reducers: {
    add(state: any) {
      state.num += 1;
    },
  },
  effects: {
    *addAsync(_action: any, { put }: any) {
      yield delay(1000);
      yield put({ type: 'add' });
    },
  },
};
        `,
      );
      logger.info('Write example model');

      h.installDeps();
    },
  });
};
