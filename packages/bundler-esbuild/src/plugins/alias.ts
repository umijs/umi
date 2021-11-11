import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import enhancedResolve from 'enhanced-resolve';
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
        onResolve({ filter: new RegExp(`^${key}`) }, async (args) => {
          const path = await resolve(
            args.importer,
            winPath(args.path).replace(new RegExp(`^${key}`), options[key]),
          );
          return {
            path,
          };
        });
      });
    },
  };
};
