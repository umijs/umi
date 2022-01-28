import { Transpiler } from '@umijs/bundler-webpack/dist/types';
import { dirname } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy: ({ userConfig }) => {
      const isSwcTranspiler = userConfig.srcTranspiler === Transpiler.swc;
      return isSwcTranspiler;
    },
  });

  // support swc find polfyill
  api.modifyConfig((memo) => {
    memo.alias['regenerator-runtime'] = dirname(
      require.resolve('regenerator-runtime/package'),
    );
    memo.alias['core-js'] = dirname(require.resolve('core-js/package'));
    return memo;
  });
};
