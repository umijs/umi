import { resolveProjectDep } from '@umijs/utils';
import { dirname, join } from 'path';

export function resolveVuePath(opts: { pkg: any; cwd: string; path: string }) {
  const vuePkgPath =
    resolveProjectDep({
      pkg: opts.pkg,
      cwd: opts.cwd,
      dep: 'vue',
    }) || dirname(require.resolve('vue/package.json'));

  return join(vuePkgPath, opts.path);
}
