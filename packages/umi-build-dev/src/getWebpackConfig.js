import { join, dirname } from 'path';
import { existsSync } from 'fs';
import getConfig from 'af-webpack/getConfig';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import px2rem from 'postcss-plugin-px2rem';
import { applyPlugins } from 'umi-plugin';
import defaultBrowsers from './defaultConfigs/browsers';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

export default function(service = {}) {
  const {
    cwd,
    plugins,
    config,
    webpackRCConfig,
    babel,
    hash,
    routes,
    libraryName,
    staticDirectory,
    extraResolveModules,
    paths,
    preact,
  } = service;
  const isDev = process.env.NODE_ENV === 'development';

  // entry
  const entryScript = join(cwd, `./${paths.tmpDirPath}/${libraryName}.js`);
  const setPublicPathFile = join(__dirname, '../template/setPublicPath.js');
  const hdFile = join(__dirname, '../template/hd/index.js');
  const compileOnDemandFile = join(__dirname, '../template/compileOnDemand.js');
  const initialEntry = config.hd ? [hdFile] : [];
  const entry = isDev
    ? {
        [libraryName]: [
          ...initialEntry,
          ...(process.env.HMR === 'none' ? [] : [webpackHotDevClientPath]),
          entryScript,
          compileOnDemandFile,
        ],
      }
    : {
        [libraryName]: [...initialEntry, setPublicPathFile, entryScript],
      };

  const pageCount = isDev ? null : Object.keys(routes).length;
  debug(`pageCount: ${pageCount}`);
  debug(`config: ${JSON.stringify(config)}`);

  // default react, support config with preact
  // 优先级：用户配置 > preact argument > default (React)
  const preactAlias = {
    react: require.resolve('preact-compat'),
    'react-dom': require.resolve('preact-compat'),
    'create-react-class': require.resolve(
      'preact-compat/lib/create-react-class',
    ),
  };
  const reactAlias = {
    react: require.resolve('react'),
    'react-dom': require.resolve('react-dom'),
  };
  let preactOrReactAlias = preact ? preactAlias : reactAlias;
  if (config.preact === true) {
    preactOrReactAlias = preactAlias;
  }
  if (config.preact === false) {
    preactOrReactAlias = reactAlias;
  }

  // 关于为啥放 webpack 而不放 babel-plugin-module-resolver 里
  // 详见：https://tinyletter.com/sorrycc/letters/babel
  const libAlias = {
    'antd-mobile': dirname(require.resolve('antd-mobile/package')),
    antd: dirname(require.resolve('antd/package')),
    'react-router-dom': dirname(require.resolve('react-router-dom/package')),
    history: dirname(require.resolve('umi-history/package')),
  };
  // 支持用户指定 antd 和 antd-mobile 的版本
  // TODO: 出错处理，用户可能指定了依赖，但未指定 npm install
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const { dependencies = {} } = require(pkgPath);
    if (dependencies.antd) {
      libAlias['antd'] = dirname(
        require.resolve(join(cwd, 'node_modules/antd/package')),
      );
    }
    if (dependencies['antd-mobile']) {
      libAlias['antd-mobile'] = dirname(
        require.resolve(join(cwd, 'node_modules/antd-mobile/package')),
      );
    }
  }

  const browserslist = webpackRCConfig.browserslist || defaultBrowsers;

  let webpackConfig = getConfig({
    cwd,
    ...webpackRCConfig,

    // 不允许配置
    entry,
    outputPath: join(paths.absOutputPath, staticDirectory),
    hash: !isDev && hash,

    // 扩展
    babel: webpackRCConfig.babel || {
      presets: [[babel, { browsers: browserslist }]],
    },
    browserslist,
    theme: { ...webpackRCConfig.theme, ...(config.hd ? { '@hd': '2px' } : {}) },
    extraResolveModules: [
      ...(webpackRCConfig.extraResolveModules || []),
      ...(extraResolveModules || []),
    ],
    define: {
      // 禁用 antd-mobile 升级提醒
      'process.env.DISABLE_ANTD_MOBILE_UPGRADE': true,
      // For registerServiceWorker.js
      'process.env.BASE_URL': process.env.BASE_URL,
      __UMI_HTML_SUFFIX: !!(
        config.exportStatic &&
        typeof config.exportStatic === 'object' &&
        config.exportStatic.htmlSuffix
      ),
      ...(webpackRCConfig.define || {}),
    },
    alias: {
      ...preactOrReactAlias,
      ...libAlias,
      ...(webpackRCConfig.alias || {}),
    },
    extraPostCSSPlugins: [
      ...(webpackRCConfig.extraPostCSSPlugins || []),
      ...(config.hd
        ? [
            px2rem({
              rootValue: 100,
              minPixelValue: 2,
            }),
          ]
        : []),
    ],
    ...(isDev
      ? {
          // 生产环境的 publicPath 是服务端把 assets 发布到 cdn 后配到 HTML 里的
          // 开发环境的 publicPath 写死 /static/
          publicPath: `/`,
        }
      : {
          publicPath: webpackRCConfig.publicPath || `./${staticDirectory}/`,
          commons: webpackRCConfig.commons || [
            {
              async: '__common',
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
                serviceWorker: {
                  ...(webpackRCConfig.serviceWorker || {}),
                },
              }),
        }),
  });

  // Usage:
  // - umi-plugin-yunfengdie
  webpackConfig = applyPlugins(plugins, 'updateWebpackConfig', webpackConfig);

  return webpackConfig;
}
