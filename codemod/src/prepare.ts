import fg from 'fast-glob';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { build } from './configBuilder';

export async function prepare(opts: { cwd: string; pattern: any; args: any }) {
  // config
  const outputFile = join(opts.cwd, 'node_modules', 'config.tmp.js');
  await build({
    configFile: join(opts.cwd, 'config/config.ts'),
    outputFile,
  });
  const config = require(outputFile).default;

  // files
  const files = await fg(opts.pattern, {
    cwd: opts.cwd,
    ignore: [
      '**/node_modules/**',
      '**/.umi/**',
      '**/.umi-production/**',
      'config/**',
    ],
  });
  const fileCache = new Map<string, string>();
  await Promise.all(
    files.map(async (file) => {
      fileCache.set(file, await fs.readFile(join(opts.cwd, file), 'utf8'));
    }),
  );

  // pkg
  const pkgPath = join(opts.cwd, 'package.json');
  const pkg = require(pkgPath);

  const unexpectedLayoutConfig = Object.keys(config.layout || {}).filter(
    (key) => !['name', 'title', 'locale'].includes(key),
  );

  const absSrcPath = existsSync(join(opts.cwd, 'src'))
    ? join(opts.cwd, 'src')
    : opts.cwd;
  let absAppJSPath = join(absSrcPath, 'app.ts');
  for (const file of ['app.tsx', 'app.ts', 'app.jsx', 'app.js']) {
    if (existsSync(join(absSrcPath, file))) {
      absAppJSPath = join(absSrcPath, file);
      break;
    }
  }

  return {
    config,
    absAppJSPath,
    pkg,
    pkgPath,
    files,
    fileCache,
    unexpectedLayoutConfig,
    deps: {
      includes: {} as Record<string, string>,
      excludes: [] as string[],
    },
    devDeps: {
      includes: {} as Record<string, string>,
      excludes: [] as string[],
    },
    args: opts.args,
  };
}
