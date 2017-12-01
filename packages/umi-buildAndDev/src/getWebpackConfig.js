import { join, dirname } from 'path';
import getConfig from 'af-webpack/getConfig';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import defaultBrowsers from './defaultConfigs/browsers';

const debug = require('debug')('umi-buildAndDev:getWebpackConfig');
const env = process.env.NODE_ENV;

export default function(opts = {}) {
  const {
    cwd,
    config,
    babel,
    hash,
    enableCSSModules,
    routeConfig,
    libraryName,
    staticDirectory,
    paths,
  } = opts;
  // browsers 配置同时给 babel-preset-env 和 autoprefixer 用
  const browsers = config.browsers || defaultBrowsers;

  // entry
  const entryScript = join(cwd, `./${paths.tmpDirPath}/${libraryName}.js`);
  const setPublicPathFile = join(__dirname, '../template/setPublicPath.js');
  const isDev = env === 'development';
  const entry = isDev
    ? {
        [libraryName]: [webpackHotDevClientPath, entryScript],
      }
    : {
        [libraryName]: [setPublicPathFile, entryScript],
      };

  const pageCount = isDev ? null : Object.keys(routeConfig).length;
  debug(`pageCount: ${pageCount}`);
  debug(`config: ${JSON.stringify(config)}`);

  return getConfig({
    cwd,
    entry,
    autoprefixer: { browsers },
    babel: {
      presets: [[babel, { browsers, libraryName }]],
    },
    theme: config.theme,
    outputPath: join(paths.absOutputPath, staticDirectory),
    hash: !isDev && hash,
    enableCSSModules,
    define: {
      // 禁用 antd-mobile 升级提醒
      // ref: http://gitlab.alipay-inc.com/twa/koi-pkgs/issues/53
      'process.env.DISABLE_ANTD_MOBILE_UPGRADE': true,
      ...(config.define || {}),
    },
    alias: {
      react: require.resolve('preact-compat'),
      'react-dom': require.resolve('preact-compat'),
      'create-react-class': require.resolve(
        'preact-compat/lib/create-react-class',
      ),
      // 关于为啥放 webpack 而不放 babel-plugin-module-resolver 里
      // 详见：https://tinyletter.com/sorrycc/letters/babel
      'antd-mobile': dirname(require.resolve('antd-mobile/package')),
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
  });
}
