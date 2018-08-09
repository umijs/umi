import getUserConfigPlugins from 'af-webpack/getUserConfigPlugins';
import { compatDirname } from 'umi-utils';
import { join, dirname } from 'path';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import defaultBrowsers from '../defaultConfigs/browsers';

const plugins = getUserConfigPlugins();

function noop() {
  return true;
}

const excludes = ['entry', 'outputPath'];

export default function(api) {
  const { debug, cwd, config, paths } = api;

  // 把 af-webpack 的配置插件转化为 umi-build-dev 的
  api._registerConfig(() => {
    return plugins
      .filter(p => !excludes.includes(p.name))
      .map(({ name, validate = noop }) => {
        return api => ({
          name,
          validate,
          onChange(newConfig) {
            try {
              debug(
                `Config ${name} changed to ${JSON.stringify(newConfig[name])}`,
              );
            } catch (e) {}
            if (name === 'proxy') {
              global.g_umi_reloadProxy(newConfig[name]);
            } else {
              api.service.restart(`${name} changed`);
            }
          },
        });
      });
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set(
        'react',
        compatDirname(
          'react/package.json',
          cwd,
          dirname(require.resolve('react/package.json')),
        ),
      )
      .set(
        'react-dom',
        compatDirname(
          'react-dom/package.json',
          cwd,
          dirname(require.resolve('react-dom/package.json')),
        ),
      )
      .set(
        'react-router',
        compatDirname(
          'react-router/package.json',
          cwd,
          dirname(require.resolve('react-router/package.json')),
        ),
      )
      .set(
        'react-router-dom',
        compatDirname(
          'react-router-dom/package.json',
          cwd,
          dirname(require.resolve('react-router-dom/package.json')),
        ),
      )
      .set(
        'history',
        compatDirname(
          'umi-history/package.json',
          cwd,
          dirname(require.resolve('umi-history/package.json')),
        ),
      )
      .set('@', paths.absSrcPath)
      .set('umi/link', join(process.env.UMI_DIR, 'lib/link'))
      .set('umi/dynamic', join(process.env.UMI_DIR, 'lib/dynamic'))
      .set('umi/navlink', join(process.env.UMI_DIR, 'lib/navlink'))
      .set('umi/redirect', join(process.env.UMI_DIR, 'lib/redirect'))
      .set('umi/router', join(process.env.UMI_DIR, 'lib/router'))
      .set('umi/withRouter', join(process.env.UMI_DIR, 'lib/withRouter'))
      .set('umi/_renderRoutes', join(process.env.UMI_DIR, 'lib/renderRoutes'))
      .set(
        'umi/_createHistory',
        join(process.env.UMI_DIR, 'lib/createHistory'),
      );
  });

  api.modifyAFWebpackOpts(memo => {
    const browserslist = config.browserslist || defaultBrowsers;
    const isDev = process.env.NODE_ENV === 'development';

    const entryScript = join(cwd, `./${paths.tmpDirPath}/umi.js`);
    const setPublicPathFile = join(
      __dirname,
      '../../template/setPublicPath.js',
    );
    const setPublicPath =
      config.runtimePublicPath ||
      (config.exportStatic && config.exportStatic.dynamicRoot);
    const entry = isDev
      ? {
          umi: [
            ...(process.env.HMR === 'none' ? [] : [webpackHotDevClientPath]),
            entryScript,
          ],
        }
      : {
          umi: [...(setPublicPath ? [setPublicPathFile] : []), entryScript],
        };

    return {
      ...memo,
      ...config,
      cwd,
      browserslist,
      entry,
      outputPath: paths.absOutputPath,
      disableDynamicImport: true,
      babel: config.babel || {
        presets: [
          [require.resolve('babel-preset-umi'), { browsers: browserslist }],
          ...(config.extraBabelPresets || []),
        ],
        plugins: config.extraBabelPlugins || [],
      },
      define: {
        'process.env.BASE_URL': config.base || '/',
        __UMI_BIGFISH_COMPAT: process.env.BIGFISH_COMPAT,
        __UMI_HTML_SUFFIX: !!(
          config.exportStatic &&
          typeof config.exportStatic === 'object' &&
          config.exportStatic.htmlSuffix
        ),
        ...(config.define || {}),
      },
      publicPath: isDev ? '/' : config.publicPath || '/',
    };
  });
}
