import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    if (process.env.UMI_DIR) {
      memo.resolve.alias.set('umi', process.env.UMI_DIR);
    }
    return memo;
  });
};
