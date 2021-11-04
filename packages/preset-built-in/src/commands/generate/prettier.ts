import { GeneratorType } from '@umijs/core';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'prettier',
    name: 'Enable Prettier',
    description: 'Enable Prettier',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      // 存在 .prettierrc，不开启
      return !existsSync(join(api.paths.cwd, '.prettierrc'));
    },
    fn: async (options) => {
      // TODO
      console.log(options);
    },
  });
};
