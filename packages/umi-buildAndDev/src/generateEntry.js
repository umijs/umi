import { join } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { writeFileSync, readFileSync } from 'fs';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import { applyPlugins } from 'umi-plugin';
import { KOI_DIRECTORY, PAGES_PATH } from './constants';
import getRouteConfig from './getRouteConfig';
import getRouterContent from './getRouterContent';

const debug = require('debug')('umi-buildAndDev:generateEntry');

let cachedRouterContent = null;
let koiJSGenerated = false;

export default function generateEntry(opts = {}) {
  const { cwd, onChange } = opts;
  const entryPath = join(cwd, PAGES_PATH, KOI_DIRECTORY);

  mkdirp(entryPath);
  const { routeConfig } = generate({ ...opts, entryPath });
  if (onChange) onChange(routeConfig);

  function watch(devServer) {
    let hasError = false;
    watchPages(cwd, () => {
      try {
        const entryPath = join(cwd, PAGES_PATH, KOI_DIRECTORY);
        const { routeConfig } = generate({ ...opts, entryPath });
        if (onChange) onChange(routeConfig);
        if (hasError) {
          // 从出错中恢复时，刷新浏览器
          devServer.sockWrite(devServer.sockets, 'content-changed');
          hasError = false;
        }
      } catch (e) {
        // 向浏览器发送出错信息
        devServer.sockWrite(devServer.sockets, 'errors', [e.message]);

        hasError = true;
        cachedRouterContent = null;
        debug(`generate failed: ${e.message}`);
        debug(e);
        console.error(chalk.red(e.message));
      }
    });
  }

  return {
    watch,
    routeConfig,
  };
}

export function watchPages(cwd, onChange) {
  const watcher = chokidar.watch(join(cwd, PAGES_PATH), {
    ignored: /(\.koi|\.idea)/,
    ignoreInitial: true,
  });
  watcher.on(
    'all',
    debounce((event, path) => {
      debug(`${event} ${path}`);
      onChange(watcher);
    }, 100),
  );
  process.on('SIGINT', () => {
    if (watcher) watcher.close();
  });
  return watcher;
}

function generate(opts = {}) {
  const { cwd, entryPath, plugins, libraryName } = opts;
  const routeConfig = getRouteConfig(join(cwd, PAGES_PATH));

  applyPlugins(plugins, 'generateEntry');

  // 缓存一次
  const routerContent = getRouterContent({
    ...opts,
    routeConfig,
    libraryName,
  });
  if (cachedRouterContent !== routerContent) {
    writeFileSync(join(entryPath, 'router.js'), routerContent, 'utf-8');
    cachedRouterContent = routerContent;
  }

  // koi.js 不会变化，生成一次即可
  if (!koiJSGenerated) {
    writeFileSync(
      join(entryPath, 'koi.js'),
      readFileSync(opts.koiJSTpl || join(__dirname, '../template/koi.js')),
      'utf-8',
    );
    koiJSGenerated = true;
  }

  return {
    routeConfig,
  };
}
