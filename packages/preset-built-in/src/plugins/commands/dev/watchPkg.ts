import { isPluginOrPreset, PluginType } from '@umijs/core';
import { chokidar, lodash, winPath } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function getUmiPlugins(opts: { pkg: any }) {
  return Object.keys({
    ...opts.pkg.dependencies,
    ...opts.pkg.devDependencies,
  }).filter((name) => {
    return (
      isPluginOrPreset(PluginType.plugin, name) ||
      isPluginOrPreset(PluginType.preset, name)
    );
  });
}

function getUmiPluginsFromPkgPath(opts: { pkgPath: string }) {
  let pkg = {};
  if (existsSync(opts.pkgPath)) {
    try {
      pkg = JSON.parse(readFileSync(opts.pkgPath, 'utf-8'));
    } catch (e) {}
  }
  return getUmiPlugins({ pkg });
}

export function watchPkg(opts: { cwd: string; onChange: Function }) {
  const pkgPath = join(opts.cwd, 'package.json');
  const plugins = getUmiPluginsFromPkgPath({ pkgPath });
  const watcher = chokidar.watch(pkgPath, {
    ignoreInitial: true,
  });
  watcher.on('all', () => {
    const newPlugins = getUmiPluginsFromPkgPath({ pkgPath });
    if (!lodash.isEqual(plugins, newPlugins)) {
      // 已经重启了，只处理一次就够了
      opts.onChange();
    }
  });
  return () => {
    watcher.close();
  };
}

export function watchPkgs(opts: { cwd: string; onChange: Function }) {
  const unwatchs = [watchPkg({ cwd: opts.cwd, onChange: opts.onChange })];
  if (winPath(opts.cwd) !== winPath(process.cwd())) {
    unwatchs.push(watchPkg({ cwd: process.cwd(), onChange: opts.onChange }));
  }
  return () => {
    unwatchs.forEach((unwatch) => {
      unwatch();
    });
  };
}
