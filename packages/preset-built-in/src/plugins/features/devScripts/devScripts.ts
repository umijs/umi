import { IApi, BundlerConfigType } from '@umijs/types';
import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';

export default (api: IApi) => {
  const isDev = api.env === 'development';
  // enable by default
  const FAST_REFRESH = process.env.FAST_REFRESH !== 'none';

  api.describe({
    key: 'devScripts',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy() {
      return isDev;
    },
  });

  api.addBeforeMiddewares(() => {
    return (req, res, next) => {
      if (req.path.includes('@@/devScripts.js')) {
        api
          .applyPlugins({
            key: 'addDevScripts',
            type: api.ApplyPluginsType.add,
            initialValue:
              process.env.HMR !== 'none'
                ? [
                    readFileSync(
                      require.resolve(
                        '@umijs/bundler-webpack/bundled/webpackHotDevClient',
                      ),
                      'utf-8',
                    ),
                  ]
                : [],
          })
          .then((scripts) => {
            res.end(scripts.join('\r\n\r\n'));
          });
      } else {
        next();
      }
    };
  });

  api.chainWebpack((config, { type }) => {
    if (type === BundlerConfigType.csr && isDev && FAST_REFRESH) {
      const { FastRefreshWebpackPlugin } = require('@umijs/fast-refresh-utils');
      config.plugin('fast-refresh-plugin').use(FastRefreshWebpackPlugin, [
        {
          type: 'react',
          overlay: false,
          useLegacyWDSSockets: true,
        },
      ]);
    }
    return config;
  });

  api.modifyBabelOpts((babelOpts) => {
    if (isDev && FAST_REFRESH) {
      // dev
      babelOpts.plugins.push([
        require.resolve('react-refresh/babel'),
        {
          skipEnvCheck: true,
        },
      ]);
    }
    return babelOpts;
  });

  api.addHTMLHeadScripts(() => [
    {
      src: `${api.config.publicPath}@@/devScripts.js`,
    },
  ]);

  api.onGenerateFiles(() => {
    const devScriptsPath = join(__dirname, 'templates/devScripts.ts.tpl');
    const devScriptsContent = readFileSync(devScriptsPath, 'utf-8');
    api.writeTmpFile({
      path: './core/devScripts.ts',
      content:
        process.env.HMR !== 'none'
          ? Mustache.render(devScriptsContent, {
              FAST_REFRESH,
              RefreshRuntimePath: require.resolve('react-refresh/runtime'),
            })
          : '',
    });
  });

  api.addEntryImportsAhead(() => [{ source: '@@/core/devScripts' }]);
};
