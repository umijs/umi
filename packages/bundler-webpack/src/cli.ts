import { chalk, yParser } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import { basename, extname, join } from 'path';
import * as process from 'process';
import { build } from './build';
import { dev } from './dev';

const args = yParser(process.argv.slice(2), {});
const command = args._[0];
const cwd = process.cwd();

const entry = tryPaths([
  join(cwd, 'src/index.tsx'),
  join(cwd, 'src/index.ts'),
  join(cwd, 'index.tsx'),
  join(cwd, 'index.ts'),
]);

if (command === 'build') {
  (async () => {
    process.env.NODE_ENV = 'production';
    assert(entry, `Build failed: entry not found.`);
    try {
      await build({
        config: {
          ...args,
        },
        cwd,
        entry: {
          [getEntryKey(entry)]: entry,
        },
      });
    } catch (e) {
      console.error(e);
    }
  })();
} else if (command === 'dev') {
  (async () => {
    process.env.NODE_ENV = 'development';
    try {
      assert(entry, `Build failed: entry not found.`);
      await dev({
        config: { ...args },
        cwd,
        entry: {
          [getEntryKey(entry)]: entry,
        },
      });
    } catch (e) {
      console.error(e);
    }
  })();
} else {
  error(`Unsupported command ${command}.`);
}

function error(msg: string) {
  console.error(chalk.red(msg));
}

function tryPaths(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) return path;
  }
}

function getEntryKey(path: string) {
  return basename(path, extname(path));
}
