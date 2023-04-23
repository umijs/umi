import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import enhancedResolve from 'enhanced-resolve';
import { existsSync, statSync } from 'fs';
import { sortByAffix } from '../utils/sortByAffix';

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

// https://esbuild.github.io/plugins/#resolve-callbacks
export default (options: Record<string, string> = {}): Plugin => {
  return {
    name: 'alias',
    setup({ onResolve }) {
      const keys = sortByAffix({ arr: Object.keys(options), affix: '$' });
      keys.forEach((key) => {
        let value = options[key];
        let filter: RegExp;
        if (key.endsWith('$')) {
          filter = new RegExp(`^${key}`);
        } else {
          filter = new RegExp(`^${key}$`);
        }
        onResolve({ filter: filter }, async (args) => {
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
          existsSync(value) &&
          statSync(value).isDirectory()
        ) {
          const filter = new RegExp(`^${addSlashAffix(key)}`);
          onResolve({ filter }, async (args) => {
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
};

function addSlashAffix(key: string) {
  if (key.endsWith('/')) {
    return key;
  }
  return `${key}/`;
}
