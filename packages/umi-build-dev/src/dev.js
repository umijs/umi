import dev from 'af-webpack/dev';
import chalk from 'chalk';
import { resolvePlugins, applyPlugins } from 'umi-plugin';
import registerBabel from './registerBabel';
import getWebpackConfig from './getWebpackConfig';
import createRouteMiddleware from './createRouteMiddleware';
import generateEntry, { watchPages } from './generateEntry';
import send, { PAGE_LIST } from './send';
import { getConfig, watchConfigs } from './getConfig';
import { unwatch } from './getConfig/watch';
import getPaths from './getPaths';

const debug = require('debug')('umi-build-dev:dev');

export default function runDev(opts) {
  const {
    cwd = process.cwd(),
    babel,
    disableCSSModules,
    extraResolveModules,
    libraryName = 'umi',
    staticDirectory = 'static',
    tmpDirectory = `.${libraryName}`,
    outputPath = './dist',
    plugins: pluginFiles,
    preact,
    extraMiddlewares = [], // TODO: move to plugins
  } = opts;
  const plugins = resolvePlugins(pluginFiles);
  const paths = getPaths({ cwd, tmpDirectory, outputPath });

  // 为配置注册 babel 解析
  registerBabel(babel, {
    configOnly: true,
  });

  // 获取用户配置
  let config = null;
  let watchConfig = null;
  try {
    const configObj = getConfig(cwd, { force: true });
    config = configObj.config;
    watchConfig = configObj.watch;
  } catch (e) {
    console.error(chalk.red(e.message));
    debug('get config failed, watch config and reload');

    // 监听配置项变更，然后重新执行 dev 逻辑
    watchConfigs().on('all', (event, path) => {
      debug(`[${event}] ${path}, unwatch and reload`);
      // 重新执行 dev 逻辑
      unwatch();
      runDev(opts);
    });
    return;
  }

  // 生成入口文件
  let watchEntry = null;
  let rebuildEntry = null;
  try {
    debug(`libraryName: ${libraryName}`);
    const entryGObj = generateEntry({
      cwd,
      plugins,
      routerTpl: opts.routerTpl,
      entryJSTpl: opts.entryJSTpl,
      libraryName,
      onChange(routeConfig) {
        sendPageList(routeConfig);
      },
      paths,
    });
    watchEntry = entryGObj.watch;
    rebuildEntry = entryGObj.rebuild;
  } catch (e) {
    console.error(chalk.red(e.message));
    console.error(chalk.red(e.stack));
    debug('generate entry failed, watch pages and reload');
    watchPages({
      cwd,
      paths,
      onChange(watcher) {
        watcher.close();
        runDev(opts);
      },
    });
    return;
  }

  // 获取 webpack 配置
  const webpackConfig = getWebpackConfig({
    cwd,
    config,
    babel,
    disableCSSModules,
    extraResolveModules,
    libraryName,
    staticDirectory,
    paths,
    preact,
  });
  debug(`webpackConfig: ${JSON.stringify(webpackConfig)}`);

  // af-webpack dev
  let webpackDevServer = null;
  let isCompileDone = false;
  let onCompileDone = () => {
    debug('default compiledone');
    isCompileDone = true;
  };
  dev({
    webpackConfig,
    extraMiddlewares: [
      createRouteMiddleware(
        cwd,
        config,
        plugins,
        staticDirectory,
        libraryName,
        paths,
        () => {
          if (!webpackDevServer) {
            throw new Error('webpackDevServer not ready');
          }
          debug(`isCompileDone: ${isCompileDone}`);
          if (!isCompileDone) {
            const defaultOnCompileDone = onCompileDone;
            onCompileDone = () => {
              debug('new compile done');
              rebuildEntry(webpackDevServer);
              defaultOnCompileDone();
              onCompileDone = () => {};
            };
          } else {
            rebuildEntry(webpackDevServer);
          }
        },
      ),
      ...extraMiddlewares,
    ],
    afterServer(devServer) {
      // 监听配置变更
      debug('watch configs');
      webpackDevServer = devServer;
      watchConfig(devServer);
      watchEntry(devServer);
    },
    onCompileDone() {
      onCompileDone();
    },
  });
}

function sendPageList(routeConfig) {
  const pageList = Object.keys(routeConfig || {}).map(path => ({ path }));
  send({
    type: PAGE_LIST,
    payload: pageList,
  });
}

// 给 umi 用，后期需要干掉，fork 的功能集中在 af-webpack 里完成
export fork from 'af-webpack/lib/fork';
