import { IApi } from '@umijs/types';
import { join } from 'path';
import webpack from 'webpack';

// ref:
// https://webpack.js.org/migrate/5/
// https://github.com/webpack/webpack/issues/9802
export default (api: IApi) => {
  api.modifyBundlerImplementor(() => {
    return webpack;
  });

  api.modifyBundleConfig(memo => {
    delete memo.output?.futureEmitAssets;
    delete memo.node;
    // url polyfill
    memo.resolve?.modules?.push(join(__dirname, '../node_modules'));
    // cache
    memo.cache = {
      type: 'filesystem',
      buildDependencies: {},
    };
    return memo;
  });
};
