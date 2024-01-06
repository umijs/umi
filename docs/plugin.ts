import { IApi } from 'dumi';

export default (api: IApi) => {
  api.modifyBabelPresetOpts((memo) => {
    // we do not write UI library so enable it
    // https://github.com/umijs/dumi/commit/c5e6c8877f5b57f649e47b664e2a6d2701961f73
    memo.pluginAutoCSSModules = {};

    return memo;
  });
};
