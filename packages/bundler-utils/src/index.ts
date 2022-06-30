import { winPath } from '@umijs/utils';
import { extname } from 'path';
import { init, parse } from '../compiled/es-module-lexer';
import { Loader, transformSync } from '../compiled/esbuild';

export async function parseModule(opts: { content: string; path: string }) {
  await init;
  return parseModuleSync(opts);
}

export function parseModuleSync(opts: { content: string; path: string }) {
  let content = opts.content;

  if (opts.path.endsWith('.tsx') || opts.path.endsWith('.jsx')) {
    content = transformSync(content, {
      loader: extname(opts.path).slice(1) as Loader,
      format: 'esm',
    }).code;
  }

  return parse(content);
}

export function isDepPath(path: string) {
  const umiMonorepoPaths = ['umi/packages/', 'umi-next/packages/'];

  return (
    path.includes('node_modules') ||
    umiMonorepoPaths.some((p) => winPath(path).includes(p))
  );
}

export * from './https';
export * from './types';
