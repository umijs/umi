import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import enhancedResolve from 'enhanced-resolve';
import fs from 'fs';
import path from 'path';

const resolver = enhancedResolve.create({
  mainFields: ['module', 'browser', 'main'],
  extensions: ['.json', '.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'],
  // TODO: support exports
  exportsFields: [],
});

async function resolve(context: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(context, path, (err: Error, result: string) =>
      err ? reject(err) : resolve(result),
    );
  });
}

function sortByAffix(opts: { keys: string[]; affix: string }) {
  return opts.keys.sort((a, b) => {
    if (a.endsWith(opts.affix) && b.endsWith(opts.affix)) return 0;
    if (a.endsWith(opts.affix)) return -1;
    if (b.endsWith(opts.affix)) return 1;
    else return 0;
  });
}

function addSlashAffix(key: string) {
  return key.endsWith('/') ? key : `${key}/`;
}

export function esbuildAliasPlugin(opts: {
  alias: Record<string, string>;
}): Plugin {
  return {
    name: 'esbuildAliasPlugin',
    setup(build) {
      // only absolute alias should be resolved
      // node deps alias should be filtered, and mark as externals with other plugins
      sortByAffix({ keys: Object.keys(opts.alias), affix: '$' })
        .filter((key) => {
          return (
            path.isAbsolute(opts.alias[key]) &&
            !opts.alias[key].includes('node_modules')
          );
        })
        .forEach((key) => {
          const value = opts.alias[key];

          const filter = key.endsWith('$')
            ? new RegExp(`^${key}`)
            : new RegExp(`^${key}$`);
          build.onResolve({ filter }, async (args) => {
            const path = await resolve(
              args.importer,
              args.path.replace(filter, value),
            );
            return {
              path,
            };
          });

          if (
            !key.endsWith('/') &&
            fs.existsSync(value) &&
            fs.statSync(value).isDirectory()
          ) {
            const filter = new RegExp(`^${addSlashAffix(key)}`);
            build.onResolve({ filter }, async (args) => {
              const path = await resolve(
                args.importer,
                args.path.replace(filter, addSlashAffix(value)),
              );
              return {
                path,
              };
            });
          }
        });
    },
  };
}
