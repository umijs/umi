import { join } from 'path';
import { getPrevDeps } from './mfsu';
import { chokidar, lodash } from '@umijs/utils';
import { IApi } from 'umi';

export function watchDeps(opts: {
  api: IApi;
  cwd: string;
  onChange: Function;
}) {
  const pkgPath = join(opts.cwd, 'package.json');
  const preDeps = getPrevDeps(opts.api);
  const watcher = chokidar.watch(pkgPath, {
    ignoreInitial: true,
  });
  watcher.on('all', () => {
    const { dependencies, peerDependencies } = require(pkgPath);
    if (!lodash.isEqual(preDeps, { ...dependencies, ...peerDependencies })) {
      opts.onChange();
    }
  });
  return () => {
    watcher.close();
  };
}
