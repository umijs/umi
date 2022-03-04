import { IApi } from 'umi';

export default (api: IApi) => {
  // avoid plugin-key conflict with configPlugins
  api.describe({
    key: 'umiProAlias',
  });
  api.modifyConfig((memo) => {
    memo.alias = {
      ...memo.alias,
      '@umijs/pro': '@@/exports',
    };
    return memo;
  });
};
