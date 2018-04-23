import { join, dirname } from 'path';
import { existsSync } from 'fs';
import getConfig from 'af-webpack/getConfig';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import defaultBrowsers from './defaultConfigs/browsers';

const debug = require('debug')('umi-build-dev:getWebpackConfig');

export default function(service = {}) {
  const {
    cwd,
    config,
    webpackRCConfig,
    babel,
    hash,
    routes,
    libraryAlias,
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

  const pageCount = isDev ? null : Object.keys(routes).length;
  debug(`pageCount: ${pageCount}`);
  debug(`config: ${JSON.stringify(config)}`);

  // default react, support config with preact
  // 优先级：用户配置 > preact argument > default (React)
  const preactAlias = {
    react: dirname(require.resolve('preact-compat/package.json')),
    'react-dom': dirname(require.resolve('preact-compat/package.json')),
    'create-react-class': require.resolve(
      'preact-compat/lib/create-react-class',
    ),
  };
  const reactAlias = {
    react: dirname(require.resolve('react/package.json')),
    'react-dom': dirname(require.resolve('react-dom/package.json')),
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
    if (preact) {
      if (dependencies['preact-compat']) {
        libAlias.react = libAlias['react-dom'] = dirname(
          // eslint-disable-line
          require.resolve(join(cwd, 'node_modules/preact-compat/package.json')),
        );
      }
    } else {
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
    hash: !isDev && hash,

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
  afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: afWebpackOpts,
  });
  debug(`afWebpackOpts: ${JSON.stringify(afWebpackOpts)}`);

  let webpackConfig = getConfig(afWebpackOpts);
  webpackConfig = service.applyPlugins('modifyWebpackConfig', {
    initialValue: webpackConfig,
  });

  return webpackConfig;
}
