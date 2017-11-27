import dev from 'af-webpack/dev';
import chalk from 'chalk';
import registerBabel from './registerBabel';
import getWebpackConfig from './getWebpackConfig';
import createRouteMiddleware from './createRouteMiddleware';
import generateEntry, { watchPages } from './generateEntry';
import send, { PAGE_LIST } from './send';
import { getConfig, watchConfigs } from './getConfig';
import { unwatch } from './getConfig/watch';

const debug = require('debug')('koi-buildAndDev:dev');

export default function runDev(opts) {
  const {
    cwd: cwdFromOpts,
    babel,
    enableCSSModules,
    extraResolveModules,
    extraMiddlewares = [],
  } = opts;

  const cwd = cwdFromOpts || process.cwd();

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
  try {
    const entryGObj = generateEntry(cwd, {
      onChange(routeConfig) {
        sendPageList(routeConfig);
      },
    });
    watchEntry = entryGObj.watch;
  } catch (e) {
    console.error(chalk.red(e.message));
    debug('generate entry failed, watch pages and reload');
    watchPages(cwd, watcher => {
      watcher.close();
      runDev(opts);
    });
    return;
  }

  // 获取 webpack 配置
  const webpackConfig = getWebpackConfig({
    cwd,
    config,
    babel,
    enableCSSModules,
    extraResolveModules,
  });

  // af-webpack dev
  dev({
    webpackConfig,
    appName: 'your app',
    extraMiddlewares: [createRouteMiddleware(cwd, config), ...extraMiddlewares],
    afterServer(devServer) {
      // 监听配置变更
      debug('watch configs');
      watchConfig(devServer);
      watchEntry(devServer);
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

// 给 koi-core 用，后期需要干掉，fork 的功能集中在 af-webpack 里完成
export forkADevServer from 'af-webpack/lib/fork';
