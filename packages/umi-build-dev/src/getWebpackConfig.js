import getConfig from 'af-webpack/getConfig';
import assert from 'assert';
import chalk from 'chalk';
import nodeExternals from 'webpack-node-externals';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

export default function(service, opts = {}) {
  const { ssr } = opts;
  const { config } = service;

  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd,
    },
    args: {
      ssr,
    },
  });

  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );
  afWebpackOpts.chainConfig = webpackConfig => {
    service.applyPlugins('chainWebpackConfig', {
      args: webpackConfig,
    });
    if (config.chainWebpack) {
      config.chainWebpack(webpackConfig, {
        webpack: require('af-webpack/webpack'),
      });
    }
  };

  const webpackConfig = service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig({
      ...afWebpackOpts,
      ssr,
    }),
  });

  if (ssr) {
    // ssr in beta hint
    console.warn(
      chalk.keyword('orange')(
        `WARNING: UmiJS SSR is still in beta, you can open issues or PRs in https://github.com/umijs/umi`,
      ),
    );
    const externalWhitelist = [
      /\.(css|less|sass|scss)$/,
      /^umi(\/.*)?$/,
      ...(ssr.externalWhitelist || []),
    ];
    debug(`externalWhitelist:`, externalWhitelist);
    webpackConfig.externals = nodeExternals({
      externalWhitelist,
    });
    webpackConfig.output.libraryTarget = 'commonjs2';
    webpackConfig.output.filename = '[name].server.js';
    webpackConfig.output.chunkFilename = '[name].server.async.js';
    webpackConfig.plugins.push(
      new (require('write-file-webpack-plugin'))({
        test: /umi\.server\.js/,
      }),
    );
  }

  return webpackConfig;
}
