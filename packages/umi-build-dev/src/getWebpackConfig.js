import { join, dirname } from 'path';
import { existsSync } from 'fs';
import getConfig from 'af-webpack/getConfig';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import defaultBrowsers from './defaultConfigs/browsers';
import getPageCountFromRoutes from './routes/getPageCountFromRoutes';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

export default function(service = {}) {
  const {
    cwd,
    config,
    babel,
    routes,
    libraryAlias,
    libraryName,
    staticDirectory,
    extraResolveModules,
    paths,
  } = service;
  const isDev = process.env.NODE_ENV === 'development';

  // merge config to webpackRCConfig
  let { webpackRCConfig } = service;
  webpackRCConfig = {
    ...(config || {}),
    ...(webpackRCConfig || {}),
  };

  // entry
  const entryScript = join(cwd, `./${paths.tmpDirPath}/${libraryName}.js`);
  const setPublicPathFile = join(__dirname, '../template/setPublicPath.js');
  const entry = isDev
    ? {
        [libraryName]: [
          ...(process.env.HMR === 'none' ? [] : [webpackHotDevClientPath]),
          entryScript,
        ],
      }
    : {
        [libraryName]: [setPublicPathFile, entryScript],
      };

  const pageCount = process.env.PAGE_COUNT || getPageCountFromRoutes(routes);
  debug(`pageCount: ${pageCount}`);

  const reactAlias = {
    react: dirname(require.resolve('react/package.json')),
    'react-dom': dirname(require.resolve('react-dom/package.json')),
  };

  // 关于为啥放 webpack 而不放 babel-plugin-module-resolver 里
  // 详见：https://tinyletter.com/sorrycc/letters/babel
  const libAlias = {
    'react-router-dom': dirname(
      require.resolve('react-router-dom/package.json'),
    ),
    'react-router': dirname(require.resolve('react-router/package.json')),
    history: dirname(require.resolve('umi-history/package.json')),
    ...Object.keys(libraryAlias).reduce((memo, key) => {
      return {
        ...memo,
        [`${libraryName}/${key}`]: libraryAlias[key],
      };
    }, {}),
  };

  // TODO: 出错处理，用户可能指定了依赖，但未指定 npm install
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const { dependencies = {} } = require(pkgPath); // eslint-disable-line
    if (dependencies.react) {
      libAlias.react = dirname(
        require.resolve(join(cwd, 'node_modules/react/package.json')),
      );
    }
    if (dependencies['react-dom']) {
      libAlias['react-dom'] = dirname(
        require.resolve(join(cwd, 'node_modules/react-dom/package.json')),
      );
    }
  }

  const browserslist = webpackRCConfig.browserslist || defaultBrowsers;
  let afWebpackOpts = {
    cwd,
    ...webpackRCConfig,

    // 不允许配置
    entry,
    outputPath:
      process.env.HTML === 'none'
        ? paths.absOutputPath
        : join(paths.absOutputPath, staticDirectory),
    hash: !isDev && !config.disableHash,

    // 扩展
    babel: webpackRCConfig.babel || {
      presets: [
        [babel, { browsers: browserslist }],
        ...(webpackRCConfig.extraBabelPresets || []),
      ],
      plugins: webpackRCConfig.extraBabelPlugins || [],
    },
    browserslist,
    extraResolveModules: [
      ...(webpackRCConfig.extraResolveModules || []),
      ...(extraResolveModules || []),
    ],
    cssModulesExcludes: [...(webpackRCConfig.cssModulesExcludes || [])],
    define: {
      // For registerServiceWorker.js
      'process.env.BASE_URL': process.env.BASE_URL,
      'process.env.BIGFISH_COMPAT': process.env.BIGFISH_COMPAT,
      __UMI_HTML_SUFFIX: !!(
        config.exportStatic &&
        typeof config.exportStatic === 'object' &&
        config.exportStatic.htmlSuffix
      ),
      ...(webpackRCConfig.define || {}),
    },
    alias: {
      ...reactAlias,
      ...libAlias,
      ...(webpackRCConfig.alias || {}),
    },
    disableDynamicImport: true,
    ...(isDev
      ? {
          // 生产环境的 publicPath 是服务端把 assets 发布到 cdn 后配到 HTML 里的
          // 开发环境的 publicPath 写死 /static/
          publicPath: `/`,
        }
      : {
          publicPath: webpackRCConfig.publicPath || `/${staticDirectory}/`,
          commons: webpackRCConfig.commons || [
            {
              async: 'common',
              children: true,
              minChunks(module, count) {
                if (pageCount <= 2) {
                  return count >= pageCount;
                }
                return count >= pageCount * 0.5;
              },
            },
          ],
          ...(config.disableServiceWorker
            ? {}
            : {
                serviceworker: {
                  ...(webpackRCConfig.serviceworker || {}),
                },
              }),
        }),
  };

  // 修改传给 af-webpack 的配置项
  // deprecated
  afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: afWebpackOpts,
  });

  // 通过 webpack-chain 扩展 webpack 配置
  let webpackConfig = getConfig(afWebpackOpts, {
    webpackChain(webpackConfig) {
      service.applyPlugins('chainWebpackConfig', {
        args: { webpackConfig },
      });
    },
  });

  // 直接修改 webpack 对象
  // deprecated
  webpackConfig = service.applyPlugins('modifyWebpackConfig', {
    initialValue: webpackConfig,
  });

  return webpackConfig;
}
