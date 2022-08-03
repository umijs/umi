import fg from 'fast-glob';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { build } from './configBuilder';

export const DEFAULT_CONFIG_FILES = [
  '.umirc.ts',
  '.umirc.js',
  'config/config.ts',
  'config/config.js',
  'config/config.dev.ts',
  'config/config.dev.js',
];

function getMainConfigFile(opts: {
  cwd: string;
  defaultConfigFiles?: string[];
}) {
  const mainConfigFile = [];
  for (const configFile of opts.defaultConfigFiles || DEFAULT_CONFIG_FILES) {
    const absConfigFile = join(opts.cwd, configFile);
    if (existsSync(absConfigFile)) {
      mainConfigFile.push(absConfigFile);
    }
  }
  if (mainConfigFile.length === 0) {
    throw new Error('umi config must exist');
  }
  return mainConfigFile;
}

export async function prepare(opts: { cwd: string; pattern: any; args?: any }) {
  // config
  const mainConfigFile = getMainConfigFile({ cwd: opts.cwd });

  const all = mainConfigFile.map((element) =>
    build({
      configFile: element,
      outputFile: join(opts.cwd, 'node_modules', `tmp.${element}`),
    }),
  );
  await Promise.all(all);

  const config = Object.fromEntries(
    mainConfigFile.map((item) => {
      const outputFile = join(opts.cwd, 'node_modules', `tmp.${item}`);
      return [item, require(outputFile).default];
    }),
  );

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
  const unexpectedLayoutConfig = Object.fromEntries(
    mainConfigFile.map((item) => {
      return [
        item,
        Object.keys(config[item].layout || {}).filter(
          (key) => !['name', 'title', 'locale'].includes(key),
        ),
      ];
    }),
  );
  const absSrcPath = existsSync(join(opts.cwd, 'src'))
    ? join(opts.cwd, 'src')
    : opts.cwd;

  let absAppJSPath = '';
  for (const file of ['app.tsx', 'app.ts', 'app.jsx', 'app.js']) {
    if (existsSync(join(absSrcPath, file))) {
      absAppJSPath = join(absSrcPath, file);
      break;
    }
  }

  let importSource = 'umi';
  const deps = {
    includes: {} as Record<string, string>,
    excludes: [] as string[],
  };
  const devDeps = {
    includes: {} as Record<string, string>,
    excludes: [] as string[],
  };

  // use alita
  if (pkg.dependencies?.['alita'] || pkg.devDependencies?.['alita']) {
    importSource = 'alita';
  }

  // default Includes antd
  deps.includes =
    importSource === 'alita'
      ? {
          'antd-mobile': '2.3.4',
        }
      : {
          antd: '^4.20.6',
        };

  // use @uminjs/max
  if (
    pkg.dependencies?.['@umijs/preset-react'] ||
    pkg.devDependencies?.['@umijs/preset-react']
  ) {
    importSource = '@umijs/max';
    if (pkg.dependencies?.['@umijs/preset-react']) {
      deps.excludes.push('@umijs/preset-react');
    }
    if (pkg.dependencies?.['umi']) {
      deps.excludes.push('umi');
    }
    if (pkg.devDependencies?.['@umijs/preset-react']) {
      devDeps.excludes.push('@umijs/preset-react');
    }
    if (pkg.devDependencies?.['umi']) {
      devDeps.excludes.push('umi');
    }
  }

  // umi lint
  const defaultExcludes = ['eslint', '@umijs/fabric', 'stylelint'];

  defaultExcludes.forEach((key) => {
    if (pkg.dependencies?.[key]) {
      deps.excludes.push(key);
    } else if (pkg.devDependencies?.[key]) {
      devDeps.excludes.push(key);
    }
  });

  return {
    config,
    configFile: mainConfigFile,
    absAppJSPath,
    pkg,
    pkgPath,
    files,
    fileCache,
    unexpectedLayoutConfig,
    deps,
    devDeps,
    args: opts.args,
    importSource: process.env.UMI_IMPORT_SOURCE ?? importSource,
  };
}
