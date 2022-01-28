import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyConfig((memo) => {
    memo.alias = {
      ...memo.alias,
      '@umijs/pro': '@@/exports',
    };
    return memo;
  });
};
