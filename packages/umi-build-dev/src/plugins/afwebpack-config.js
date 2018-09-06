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

  const reactDir = compatDirname(
    'react/package.json',
    cwd,
    dirname(require.resolve('react/package.json')),
  );
  const reactDOMDir = compatDirname(
    'react-dom/package.json',
    cwd,
    dirname(require.resolve('react-dom/package.json')),
  );
  const reactRouterDir = compatDirname(
    'react-router/package.json',
    cwd,
    dirname(require.resolve('react-router/package.json')),
  );
  const reactRouterDOMDir = compatDirname(
    'react-router-dom/package.json',
    cwd,
    dirname(require.resolve('react-router-dom/package.json')),
  );
  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set('react', reactDir)
      .set('react-dom', reactDOMDir)
      .set('react-router', reactRouterDir)
      .set('react-router-dom', reactRouterDOMDir)
      .set(
        'history',
        compatDirname(
          'umi-history/package.json',
          cwd,
          dirname(require.resolve('umi-history/package.json')),
        ),
      )
      .set('@', paths.absSrcPath)
      .set('umi/link', join(process.env.UMI_DIR, 'lib/link.js'))
      .set('umi/dynamic', join(process.env.UMI_DIR, 'lib/dynamic.js'))
      .set('umi/navlink', join(process.env.UMI_DIR, 'lib/navlink.js'))
      .set('umi/redirect', join(process.env.UMI_DIR, 'lib/redirect.js'))
      .set('umi/router', join(process.env.UMI_DIR, 'lib/router.js'))
      .set('umi/withRouter', join(process.env.UMI_DIR, 'lib/withRouter.js'))
      .set(
        'umi/_renderRoutes',
        join(process.env.UMI_DIR, 'lib/renderRoutes.js'),
      )
      .set(
        'umi/_createHistory',
        join(process.env.UMI_DIR, 'lib/createHistory.js'),
      );
  });

  api.addVersionInfo([
    `react@${require(join(reactDir, 'package.json')).version} (${reactDir})`,
    `react-dom@${
      require(join(reactDOMDir, 'package.json')).version
    } (${reactDOMDir})`,
    `react-router@${
      require(join(reactRouterDir, 'package.json')).version
    } (${reactRouterDir})`,
    `react-router-dom@${
      require(join(reactRouterDOMDir, 'package.json')).version
    } (${reactRouterDOMDir})`,
  ]);

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
            ...(setPublicPath ? [setPublicPathFile] : []),
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
          [
            require.resolve('babel-preset-umi'),
            { targets: { browsers: browserslist } },
          ],
        ],
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
