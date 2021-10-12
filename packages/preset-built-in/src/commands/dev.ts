import { importLazy, portfinder } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { basename, extname, join } from 'path';
import * as process from 'process';
import { DEFAULT_HOST, DEFAULT_PORT } from '../constants';
import { IApi } from '../types';

const { dev }: typeof import('@umijs/bundler-webpack') = importLazy(
  '@umijs/bundler-webpack',
  require,
);

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev';
    },
  });

  api.registerCommand({
    name: 'dev',
    description: 'dev server for development',
    details: `
umi dev

# dev with specified port
PORT=8888 umi dev
`,
    async fn() {
      // clear tmp except cache
      // generate files
      // watch package.json change
      // watch config change

      const entry = getEntry(api.cwd);
      assert(entry, `Build failed: entry not found.`);
      await dev({
        config: api.config,
        cwd: api.cwd,
        entry: {
          [getEntryKey(entry)]: entry,
        },
        port: api.appData.port,
        host: api.appData.host,
        beforeMiddlewares: [],
        afterMiddlewares: [],
      });
    },
  });

  api.modifyAppData(async (memo) => {
    memo.port = await portfinder.getPortPromise({
      port: parseInt(String(process.env.PORT || DEFAULT_PORT), 10),
    });
    memo.host = process.env.HOST || DEFAULT_HOST;
    return memo;
  });
};

function getEntry(cwd: string) {
  return tryPaths([
    join(cwd, 'src/index.tsx'),
    join(cwd, 'src/index.ts'),
    join(cwd, 'index.tsx'),
    join(cwd, 'index.ts'),
  ]);
}

function tryPaths(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) return path;
  }
}

function getEntryKey(path: string) {
  return basename(path, extname(path));
}
