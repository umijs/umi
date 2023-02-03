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
  const lastQuestionMarkIdx = file.lastIndexOf('?');
  if (lastQuestionMarkIdx > 0) {
    file = file.substring(0, lastQuestionMarkIdx);
  }
  const lastDotIdx = file.lastIndexOf('.');
  const lastSlashIdx = file.lastIndexOf('/');
  if (lastDotIdx > 0 && (lastSlashIdx < 0 || lastDotIdx > lastSlashIdx)) {
    return file.substring(lastDotIdx + 1);
  }
}

const SOURCE_REG = /\.(t|j)sx?$/;
function isSource(file: string) {
  // perf optimization
  if (SOURCE_REG.test(file)) {
    return true;
  }
  const ext = parseExt(file);
  return !ext || ext === 'tsx' || ext === 'ts' || ext === 'jsx' || ext === 'js';
}
