import { Plugin, PluginBuild } from '@umijs/bundler-utils/compiled/esbuild';
import type { DepOptimizationOptions } from 'vite';
import type { createResolver } from '../../../libs/scan';

/**
 * only external top level import, exclude sub-path imports for esmi
 * example:
 *   - import from 'antd' will be externalized
 *   - import from 'antd/dist/antd.less' will not be externalized
 */
export default function topLevelExternal({
  exclude,
  resolver,
}: {
  exclude: NonNullable<DepOptimizationOptions['exclude']>;
  resolver: ReturnType<typeof createResolver>;
}): Plugin {
  const regSafeExclude = exclude.map((e) =>
    e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const subImportRegExp = new RegExp(`^(${regSafeExclude.join('|')})/`);
  const extRegExp = /\.((?<!d)\.ts|jsx?|tsx)$/;

  return {
    name: 'preset-umi:esmi-top-level-external',

    setup(build: PluginBuild) {
      build.onResolve(
        {
          filter: subImportRegExp,
        },
        async (args) => {
          const resolved = await resolver.resolve(args.resolveDir, args.path);

          // only process javascript-like files
          if (extRegExp.test(resolved)) {
            return { path: resolved };
          }
        },
      );
    },
  };
}
