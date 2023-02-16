import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import path from 'path';

export function esbuildExternalPlugin(): Plugin {
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

        const winP = winPath(args.path);
        const isAliasImport = winP.startsWith('@/') || winP.startsWith('@@/');
        if (isAliasImport) {
          return null;
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
