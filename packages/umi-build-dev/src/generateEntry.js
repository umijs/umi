import { join } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { writeFileSync, readFileSync } from 'fs';
import chokidar from 'chokidar';
import chalk from 'chalk';
import debounce from 'lodash.debounce';
import { applyPlugins } from 'umi-plugin';
import getRouteConfig from './getRouteConfig';
import getRouterContent from './getRouterContent';

const debug = require('debug')('umi-build-dev:generateEntry');

let cachedRouterContent = null;
let koiJSGenerated = false;

export default function generateEntry(opts = {}) {
  const { cwd, onChange, paths } = opts;
  const { absTmpDirPath } = paths;

  mkdirp(absTmpDirPath);
  const { routeConfig } = generate(opts);
  if (onChange) onChange(routeConfig);

  let hasError = false;

  function rebuild(devServer) {
    try {
      const { routeConfig } = generate(opts);
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
  }

  function watch(devServer) {
    watchPages({
      cwd,
      paths,
      onChange: rebuild.bind(null, devServer),
    });
  }

  return {
    watch,
    routeConfig,
    rebuild,
  };
}

export function watchPages(opts = {}) {
  const { cwd, onChange, paths } = opts;
  const watcher = chokidar.watch(paths.absPagesPath, {
    ignored: /(^|[\/\\])\../, // ignore .dotfiles
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
  const { paths, plugins, libraryName } = opts;
  const { absTmpDirPath, absPagesPath } = paths;
  const routeConfig = getRouteConfig(absPagesPath);

  applyPlugins(plugins, 'generateEntry', null, opts);

  // 缓存一次
  const routerContent = getRouterContent({
    ...opts,
    routeConfig,
    libraryName,
  });
  if (cachedRouterContent !== routerContent) {
    writeFileSync(join(absTmpDirPath, 'router.js'), routerContent, 'utf-8');
    cachedRouterContent = routerContent;
  }

  // koi.js 不会变化，生成一次即可
  if (process.env.DISABLE_KOIJS_G_CACHE || !koiJSGenerated) {
    writeFileSync(
      join(absTmpDirPath, `${libraryName}.js`),
      readFileSync(opts.entryJSTpl || join(__dirname, '../template/entry.js')),
      'utf-8',
    );
    koiJSGenerated = true;
  }

  return {
    routeConfig,
  };
}
