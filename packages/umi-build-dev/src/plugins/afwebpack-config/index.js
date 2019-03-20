import getUserConfigPlugins from 'af-webpack/getUserConfigPlugins';
import { compatDirname } from 'umi-utils';
import { join, dirname } from 'path';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';

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
  const reactRouterConfigDir = compatDirname(
    'react-router-config/package.json',
    cwd,
    dirname(require.resolve('react-router-config/package.json')),
  );
  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set('react', reactDir)
      .set('react-dom', reactDOMDir)
      .set('react-router', reactRouterDir)
      .set('react-router-dom', reactRouterDOMDir)
      .set('react-router-config', reactRouterConfigDir)
      .set(
        'history',
        compatDirname(
          'umi-history/package.json',
          cwd,
          dirname(require.resolve('umi-history/package.json')),
        ),
      )
      .set('@', paths.absSrcPath)
      .set('@tmp', paths.absTmpDirPath)
      .set('umi/link', join(process.env.UMI_DIR, 'lib/link.js'))
      .set('umi/dynamic', join(process.env.UMI_DIR, 'lib/dynamic.js'))
      .set('umi/navlink', join(process.env.UMI_DIR, 'lib/navlink.js'))
      .set('umi/redirect', join(process.env.UMI_DIR, 'lib/redirect.js'))
      .set('umi/prompt', join(process.env.UMI_DIR, 'lib/prompt.js'))
      .set('umi/router', join(process.env.UMI_DIR, 'lib/router.js'))
      .set('umi/withRouter', join(process.env.UMI_DIR, 'lib/withRouter.js'))
      .set(
        'umi/_renderRoutes',
        join(process.env.UMI_DIR, 'lib/renderRoutes.js'),
      )
      .set(
        'umi/_createHistory',
        join(process.env.UMI_DIR, 'lib/createHistory.js'),
      )
      .set(
        'umi/_runtimePlugin',
        join(process.env.UMI_DIR, 'lib/runtimePlugin.js'),
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
    `react-router-config@${
      require(join(reactRouterConfigDir, 'package.json')).version
    } (${reactRouterConfigDir})`,
  ]);

  api.modifyAFWebpackOpts(memo => {
    const isDev = process.env.NODE_ENV === 'development';

    const entryScript = join(cwd, `./${paths.tmpDirPath}/umi.js`);
    const setPublicPathFile = join(
      __dirname,
      '../../../template/setPublicPath.js',
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

    const targets = {
      chrome: 49,
      firefox: 64,
      safari: 10,
      edge: 13,
      ios: 10,
      ...(config.targets || {}),
    };

    // Transform targets to browserslist for autoprefixer
    const browserslist =
      config.browserslist ||
      targets.browsers ||
      Object.keys(targets)
        .filter(key => {
          return !['node', 'esmodules'].includes(key);
        })
        .map(key => {
          return `${key} >= ${targets[key]}`;
        });

    return {
      ...memo,
      ...config,
      cwd,
      browserslist,
      entry,
      absNodeModulesPath: paths.absNodeModulesPath,
      outputPath: paths.absOutputPath,
      disableDynamicImport: true,
      babel: config.babel || {
        presets: [
          [
            require.resolve('babel-preset-umi'),
            {
              targets,
              env: {
                useBuiltIns: 'entry',
                ...(config.treeShaking ? { modules: false } : {}),
              },
            },
          ],
        ],
        plugins: [require.resolve('./lockCoreJSVersionPlugin')],
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
      publicPath: isDev
        ? '/'
        : config.publicPath != null
        ? config.publicPath
        : '/',
    };
  });
}
