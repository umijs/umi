import { checkVersion } from '@umijs/utils';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onCheck(() => {
    // mako 仅支持 node 16+
    // ref: https://github.com/umijs/mako/issues/300
    if (api.userConfig.mako) {
      checkVersion(16, `Node 16 is required when using mako.`);
    }
  });
};
