import { Plugin, PluginBuild } from '@umijs/bundler-utils/compiled/esbuild';
import { camelCase } from '@umijs/utils/compiled/lodash';
import type { DepOptimizationOptions } from 'vite';

/**
 * transform require call to import
 */
export default function requireToImportPlugin({
  exclude,
}: {
  exclude: NonNullable<DepOptimizationOptions['exclude']>;
}): Plugin {
  const regSafeExclude = exclude.map((e) =>
    e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const requireRegExp = new RegExp(`^(${regSafeExclude.join('|')})$`);

  return {
    name: 'preset-umi:esmi-require-to-import',

    setup(build: PluginBuild) {
      // handler require calls for external deps
      build.onResolve(
        {
          filter: requireRegExp,
        },
        async (args) => {
          if (args.kind === 'require-call') {
            return {
              path: args.path,
              namespace: 'esmi-require-to-import',
              pluginData: {
                resolveDir: args.resolveDir,
              },
            };
          }
        },
      );

      // replace load content
      build.onLoad(
        {
          filter: /.*/,
          namespace: 'esmi-require-to-import',
        },
        (args) => {
          const { resolveDir } = args.pluginData || {};
          const packageName = args.path;
          const starSpecifier = `${camelCase(packageName)}Star`;
          const defaultSpecifier = `${camelCase(packageName)}Default`;

          return {
            resolveDir,
            contents: [
              `import * as ${starSpecifier} from '${packageName}';`,
              '',
              `const ${defaultSpecifier} = ${starSpecifier}.default ? ${starSpecifier}.default : ${starSpecifier};`,
              '',
              `export default ${defaultSpecifier};`,
              `export * from '${packageName}';`,
              '',
            ].join('\n'),
          };
        },
      );
    },
  };
}
