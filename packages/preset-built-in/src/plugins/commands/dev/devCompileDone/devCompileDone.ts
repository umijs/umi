import { IApi } from '@umijs/types';
import DevCompileDonePlugin from './DevCompileDonePlugin';

export default (api: IApi) => {
  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (env === 'development' && id === 'webpack') {
      bundleConfig.plugins?.push(
        new DevCompileDonePlugin({
          port: api.getPort(),
          hostname: api.getHostname(),
          https: !!(api.config?.devServer?.https || process.env.HTTPS),
          onCompileDone({ isFirstCompile, stats }) {
            if (isFirstCompile) {
              api.service.emit('firstDevCompileDone');
            }
            api
              .applyPlugins({
                key: 'onDevCompileDone',
                type: api.ApplyPluginsType.event,
                args: {
                  isFirstCompile,
                  stats,
                },
              })
              .catch(e => {});
          },
          onCompileFail() {},
        }),
      );
    }
    return bundleConfig;
  });
};
