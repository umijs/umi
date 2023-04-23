import { dirname, join } from 'path';
import { resolve } from 'umi/plugin-utils';

export function resolveProjectDep(opts: {
  pkg: any;
  cwd: string;
  dep: string;
}) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package.json`, {
        basedir: opts.cwd,
      }),
    );
  }
}

export function resolveVuePath(opts: { pkg: any; cwd: string; path: string }) {
  const vuePkgPath =
    resolveProjectDep({
      pkg: opts.pkg,
      cwd: opts.cwd,
      dep: 'vue',
    }) || dirname(require.resolve('vue/package.json'));

  return join(vuePkgPath, opts.path);
}
