import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { aliasUtils, winPath } from '@umijs/utils';
import path from 'path';

export function esbuildExternalPlugin(opts: {
  alias: Record<string, string>;
}): Plugin {
  const { alias } = opts;
  return {
    name: 'esbuildExternalPlugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        // only handle js/ts file
        if (!isSource(args.path)) {
          return {
            external: true,
          };
        }

        if (args.path.startsWith('.')) {
          return null;
        }

        if (args.kind === 'entry-point') {
          return null;
        }

        // alias handle
        // we need alias import, but not import from node_modules
        const isAbsoluteImport = path.isAbsolute(args.path);
        if (!isAbsoluteImport) {
          const winP = winPath(args.path);
          const aliasImport = aliasUtils.getAliasValue({
            alias,
            imported: winP,
          });
          if (aliasImport && !aliasImport.includes('node_modules')) {
            return null;
          }
        }

        // 不在 node_modules 里的，并且以 / 开头的，不走 external
        // e.g.
        // /abc > none external
        // /xxx/node_modules/xxx > external
        const isNodeModuleImport = args.path.includes('node_modules');
        if (path.isAbsolute(args.path) && !isNodeModuleImport) {
          return null;
        }

        return {
          external: true,
        };
      });
    },
  };
}

function parseExt(file: string) {
  const ext = path.extname(file);
  const idx = ext.indexOf('?');
  if (idx > 0) {
    return ext.slice(0, idx);
  }
  return ext;
}

const SOURCE_REG = /\.(t|j)sx?$/;
function isSource(file: string) {
  if (SOURCE_REG.test(file)) {
    return true;
  }
  // allow import without ext
  const ext = parseExt(file);
  return !ext;
}
