import { IApi } from '@umijs/types';
import { chalk, yParser } from '@umijs/utils';
import DevCompileDonePlugin from './DevCompileDonePlugin';

const args = yParser(process.argv.slice(2));

export default (api: IApi) => {
  api.modifyBundleConfig(
    (bundleConfig, { env, bundler: { id }, mfsu, type }) => {
      if (!mfsu && env === 'development' && id === 'webpack') {
        bundleConfig.plugins?.push(
          new DevCompileDonePlugin({
            port: api.getPort(),
            hostname: api.getHostname(),
            https: !!(
              (api.config?.devServer && api.config?.devServer?.https) ||
              process.env.HTTPS ||
              args?.https
            ),
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
                    type,
                    stats,
                  },
                })
                .catch((e) => {
                  console.error(chalk.red(e.stack));
                });
            },
            onCompileFail() {},
          }),
        );
      }
      return bundleConfig;
    },
  );
};
