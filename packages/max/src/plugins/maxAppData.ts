import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyAppData((memo) => {
    memo.umi.name = 'Umi Max';
    memo.umi.importSource = '@umijs/max';
    memo.umi.cliName = 'max';
    return memo;
  });
};
