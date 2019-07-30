import getConfig from 'af-webpack/getConfig';
import assert from 'assert';
import chalk from 'chalk';
import { deprecate } from 'umi-utils';
import { IExportSSROpts } from 'umi-types/config';
import { IApi, IWebpack } from 'umi-types';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

interface IOpts {
  ssr?: IExportSSROpts;
}

export default function(service: IApi, opts: IOpts = {}) {
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

  const webpackConfig: IWebpack.Configuration = service.applyPlugins('modifyWebpackConfig', {
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
    if (typeof ssr === 'object' && ssr.externalWhitelist) {
      deprecate('ssr.externalWhitelist');
    }
    webpackConfig.externals = (typeof ssr === 'object' && ssr.externals) || {};
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
