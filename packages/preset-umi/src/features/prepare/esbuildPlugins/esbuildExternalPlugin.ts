import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { aliasUtils, winPath } from '@umijs/utils';
import path from 'path';
import { isRelativePath } from './isRelative';

export function esbuildExternalPlugin(opts: {
  alias: Record<string, string>;
}): Plugin {
  const { alias } = opts;
  return {
    name: 'esbuildExternalPlugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        // don't handle special files
        if (args.path.includes('_UMI_PREPARE_EXTERNAL_')) {
          return {
            external: true,
          };
        }

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

          if (aliasImport) {
            // contains node_modules must be an external dep
            if (aliasImport.includes('node_modules')) {
              return { external: true };
            }
            // non node_modules abs path, if this happens, it means that the `esbuildAliasPlugin` missed out alias matching
            // this is a known case that happened in windows when using `@/pages/xxx.tsx`
            if (path.isAbsolute(aliasImport)) {
              return null;
            }
            // a relative path, left it to alias plugin to resolve
            if (isRelativePath(aliasImport)) {
              return null;
            }
            // not a path, a pkg name, external it; e.g {alias: {request: 'umi-request'} }
            return { external: true };
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
