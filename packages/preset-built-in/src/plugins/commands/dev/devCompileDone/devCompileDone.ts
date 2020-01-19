import { IApi } from '@umijs/types';
import DevCompileDonePlugin from './DevCompileDonePlugin';

export default (api: IApi) => {
  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (env === 'development' && id === 'webpack') {
      bundleConfig.plugins?.push(
        new DevCompileDonePlugin({
          port: api.getPort(),
          onCompileDone() {},
          onCompileFail() {},
        }),
      );
    }
    return bundleConfig;
  });
};
