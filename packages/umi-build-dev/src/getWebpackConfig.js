import { join, dirname } from 'path';
import { existsSync } from 'fs';
import getConfig from 'af-webpack/getConfig';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import px2rem from 'postcss-plugin-px2rem';
import defaultBrowsers from './defaultConfigs/browsers';

const debug = require('debug')('umi-build-dev:getWebpackConfig');
const env = process.env.NODE_ENV;

export default function(opts = {}) {
  const {
    cwd,
    config,
    babel,
    hash,
    disableCSSModules,
    routeConfig,
    libraryName,
    staticDirectory,
    extraResolveModules,
    paths,
    preact,
  } = opts;
  // browsers 配置同时给 babel-preset-env 和 autoprefixer 用
  const browsers = config.browsers || defaultBrowsers;

  // entry
  const entryScript = join(cwd, `./${paths.tmpDirPath}/${libraryName}.js`);
  const setPublicPathFile = join(__dirname, '../template/setPublicPath.js');
  const hdFile = join(__dirname, '../template/hd/index.js');
  const compileOnDemandFile = join(__dirname, '../template/compileOnDemand.js');
  const isDev = env === 'development';
  const initialEntry = config.hd ? [hdFile] : [];
  const entry = isDev
    ? {
        [libraryName]: [
          ...initialEntry,
          ...(process.env.DISABLE_HMR ? [] : [webpackHotDevClientPath]),
          entryScript,
          compileOnDemandFile,
        ],
      }
    : {
        [libraryName]: [...initialEntry, setPublicPathFile, entryScript],
      };

  const pageCount = isDev ? null : Object.keys(routeConfig).length;
  debug(`pageCount: ${pageCount}`);
  debug(`config: ${JSON.stringify(config)}`);

  // default react, support config with preact
  const reactAlias = preact
    ? {
        react: require.resolve('preact-compat'),
        'react-dom': require.resolve('preact-compat'),
        'create-react-class': require.resolve(
          'preact-compat/lib/create-react-class',
        ),
      }
    : {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
      };

  // 关于为啥放 webpack 而不放 babel-plugin-module-resolver 里
  // 详见：https://tinyletter.com/sorrycc/letters/babel
  const libAlias = {
    'antd-mobile': dirname(require.resolve('antd-mobile/package')),
    antd: dirname(require.resolve('antd/package')),
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

  return getConfig({
    cwd,
    entry,
    autoprefixer: { browsers },
    babel: {
      presets: [[babel, { browsers }]],
    },
    theme: { ...config.theme, ...(config.hd ? { '@hd': '2px' } : {}) },
    outputPath: join(paths.absOutputPath, staticDirectory),
    hash: !isDev && hash,
    disableCSSModules,
    extraResolveModules,
    extraBabelIncludes: config.extraBabelIncludes,
    define: {
      // 禁用 antd-mobile 升级提醒
      'process.env.DISABLE_ANTD_MOBILE_UPGRADE': true,
      ...(config.define || {}),
    },
    alias: {
      ...reactAlias,
      ...libAlias,
      ...(config.alias || {}),
    },
    ...(isDev
      ? {
          // 生成环境的 publicPath 是服务端把 assets 发布到 cdn 后配到 HTML 里的
          // 开发环境的 publicPath 写死 /static/
          publicPath: `/${staticDirectory}/`,
        }
      : {}),
    commons: isDev
      ? []
      : [
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
    extraPostCSSPlugins: config.hd
      ? [
          px2rem({
            rootValue: 100,
            minPixelValue: 2,
          }),
        ]
      : [],
  });
}
