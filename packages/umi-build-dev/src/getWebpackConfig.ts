import getConfig from 'af-webpack/getConfig';
import assert from 'assert';
import chalk from 'chalk';
import { IExportSSROpts } from 'umi-types/config';
import { IApi, IWebpack } from 'umi-types';
import nodeExternals from 'webpack-node-externals';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

interface IOpts {
  ssr?: IExportSSROpts;
  watch?: boolean;
}

export default function(service: IApi, opts: IOpts = {}) {
  const { ssr, watch } = opts;
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
    const nodeExternalsOpts = {
      whitelist: [
        /\.(css|less|sass|scss|styl(us)?)$/,
        /^umi(\/.*)?$/,
        'umi-plugin-locale',
        ...(typeof ssr === 'object' && ssr.externalWhitelist ? ssr.externalWhitelist : []),
      ],
      // for unit test
      ...(typeof ssr === 'object' && ssr.nodeExternalsOpts ? ssr.nodeExternalsOpts : {}),
    };

    webpackConfig.target = 'node';
    debug(`nodeExternalOpts:`, nodeExternalsOpts);
    const defaultExternals =
      (typeof ssr === 'object' && ssr.disableExternalWhiteList) || webpackConfig.externals || [];
    webpackConfig.externals =
      typeof ssr === 'object' && ssr.disableExternal
        ? defaultExternals
        : [nodeExternals(nodeExternalsOpts)];
    webpackConfig.output.libraryTarget = 'commonjs2';
    webpackConfig.output.filename = '[name].server.js';
    webpackConfig.output.chunkFilename = '[name].server.async.js';
    webpackConfig.plugins.push(
      new (require('write-file-webpack-plugin'))({
        // not only `umi.server.js`
        // if addEntry across chainWebpack
        test: /\.server\.js/,
      }),
    );
  }

  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && watch) {
    webpackConfig.devtool = 'eval-source-map';
    webpackConfig.watch = true;
  }

  return webpackConfig;
}
