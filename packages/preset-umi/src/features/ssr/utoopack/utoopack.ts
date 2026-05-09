import { Env } from '@umijs/bundler-webpack/dist/types';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import path, { basename, dirname, join } from 'path';
import { IApi } from '../../../types';
import { absServerBuildPath } from '../utils';

function addPublicPath(publicPath: string, file: string) {
  if (/^(?:https?:)?\/\//.test(file) || file.startsWith('/')) {
    return file;
  }
  if (publicPath === 'auto') {
    return `/${file}`;
  }
  return `${publicPath.replace(/\/?$/, '/')}${file}`;
}

function getServerBuildFile(stats: any) {
  const statsJson = stats?.toJson ? stats.toJson() : stats || {};
  const entrypoint = statsJson.entrypoints?.['umi.server'];
  const files = new Set<string>();

  for (const asset of entrypoint?.assets || []) {
    files.add(typeof asset === 'string' ? asset : asset.name);
  }

  for (const chunkId of entrypoint?.chunks || []) {
    const chunk = (statsJson.chunks || []).find((item: any) => {
      return item?.id === chunkId || item?.names?.includes?.(chunkId);
    });
    for (const file of chunk?.files || []) {
      files.add(file);
    }
  }

  for (const asset of statsJson.assets || []) {
    const name = typeof asset === 'string' ? asset : asset.name;
    if (/^umi\.server(?:\..*)?\.js$/.test(basename(name))) {
      files.add(name);
    }
  }

  return Array.from(files).find((file) => /\.m?js$/.test(file));
}

export const build = async (api: IApi, opts: any) => {
  logger.wait('[SSR] Compiling by utoopack...');
  const now = new Date().getTime();
  const absOutputFile = absServerBuildPath(api);
  require('@umijs/bundler-webpack/dist/requireHook');

  const { buildSSR } = require(process.env.UTOOPACK!);
  const useHash = api.config.hash && api.env === Env.production;
  const publicPath = api.userConfig.publicPath || '/';
  const entry = path.resolve(api.paths.absTmpPath, 'umi.server.ts');
  const stats = await buildSSR({
    ...opts,
    cwd: api.cwd,
    entry: {
      'umi.server': entry,
    },
    config: api.config,
    serverBuildPath: absOutputFile,
    useHash,
  });

  const serverFile = getServerBuildFile(stats) || basename(absOutputFile);
  const jsonFilePath = join(dirname(absOutputFile), 'build-manifest.json');
  const assets = {
    'umi.server.js': addPublicPath(publicPath, serverFile),
    'umi.js': addPublicPath(publicPath, serverFile),
  };

  if (!existsSync(dirname(absOutputFile))) {
    require('fs').mkdirSync(dirname(absOutputFile), { recursive: true });
  }
  writeFileSync(jsonFilePath, JSON.stringify({ assets }, null, 2), {
    flag: 'w',
  });

  const diff = new Date().getTime() - now;
  logger.info(`[SSR] Compiled in ${diff}ms`);
};
