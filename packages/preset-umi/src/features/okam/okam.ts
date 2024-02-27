import { checkVersion } from '@umijs/utils';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy: () => Boolean(process.env.OKAM),
  });

  api.onCheck(() => {
    // mako 仅支持 node 16+
    // ref: https://github.com/umijs/mako/issues/300
    checkVersion(16, `Node 16 is required when using mako.`);
  });

  api.modifyAppData((memo) => {
    memo.bundler = 'mako';

    return memo;
  });
};
