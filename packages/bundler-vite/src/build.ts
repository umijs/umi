import fs from 'fs';
import path from 'path';
import { build as viteBuilder } from 'vite';
import { mergeConfig } from 'vite';
import deleteOuputFiles from './plugins/deleteOuputFiles';
import { getConfig } from './config/config';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

interface IBuildResult {
  isFirstCompile: boolean;
  stats?: any;
  time: number;
  err?: Error;
}

/**
 * get umi template directory from entry
 */
function getUmiTmpDir(entry: IOpts['entry']) {
  const mainEntry = Object.values(entry).find((p) => p.includes('/umi.ts'));

  return mainEntry && path.dirname(mainEntry);
}

/**
 * generate temp html entry for vite builder
 * @param cwd   project root
 * @param entry umi entry config
 */
function generateTempEntry(cwd: string, entry: IOpts['entry']) {
  const umiTmpDir = entry && getUmiTmpDir(entry);

  if (umiTmpDir) {
    const entryTmpDir = path.join(umiTmpDir, '.bundler-vite-entry');

    fs.mkdirSync(entryTmpDir);

    return Object.keys(entry).reduce<IOpts['entry']>((r, name) => {
      const entryFilePath = path.join(entryTmpDir, `${name}.html`);

      fs.writeFileSync(
        entryFilePath,
        `<html><body><script type="module" src="${entry[name]}"></script></body></html>`,
        'utf8',
      );

      return {
        ...r,
        [name]: path.relative(cwd, entryFilePath),
      };
    }, {});
  }
}

export async function build(opts: IOpts): Promise<void> {
  const startTms = +new Date();
  const result: IBuildResult = {
    isFirstCompile: true,
    time: 0,
  };
  const tmpHtmlEntry = generateTempEntry(opts.cwd, opts.entry);
  const viteUserConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    userConfig: opts.config,
  });
  const viteBuildConfig = mergeConfig(
    {
      root: opts.cwd,
      mode: Env.production,
      build: {
        // generate assets into top dir
        assetsDir: '',
        rollupOptions: tmpHtmlEntry
          ? // first use entry from options
            {
              // use temp html entry for vite build
              input: tmpHtmlEntry,
              // remove temp html entry after build
              plugins: [deleteOuputFiles(Object.values(tmpHtmlEntry))],
            }
          : // fallback to vite default entry
            {},
      },
    },
    viteUserConfig,
  );

  try {
    result.stats = await viteBuilder(
      mergeConfig(viteBuildConfig, viteUserConfig),
    );
    result.time = +new Date() - startTms;
  } catch (err: any) {
    result.err = err;
  }

  opts.onBuildComplete && opts.onBuildComplete(result);
}
