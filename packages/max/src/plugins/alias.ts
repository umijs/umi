import { IApi } from 'umi';

export default (api: IApi) => {
  // avoid plugin-key conflict with configPlugins
  api.describe({
    key: 'umiMaxAlias',
  });
  api.modifyConfig((memo) => {
    memo.alias = {
      ...memo.alias,
      '@umijs/max': '@@/exports',
    };
    return memo;
  });
};
