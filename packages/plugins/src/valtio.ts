import { IApi } from 'umi';
import { dirname } from 'path';
import { winPath } from '@umijs/utils';

// TODO:
// - generator
// - builtinStore
// - lint

export default (api: IApi) => {
  api.describe({
    key: 'valtio',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  const libPath = winPath(
    dirname(require.resolve('@umijs/valtio/package.json')),
  );

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export {
  proxy,
  useSnapshot,
  snapshot,
  subscribe,
  subscribeKey,
  proxyWithComputed,
  proxyWithHistory,
  proxyWithDevtools,
  proxyMap,
  proxySet,
  derive,
  underive,
} from '${libPath}';
      `,
    });
  });

  api.modifyConfig((memo) => {
    memo.alias = {
      ...memo.alias,
      '@umijs/valtio': libPath,
    };
    return memo;
  });
};
