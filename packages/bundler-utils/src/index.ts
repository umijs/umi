import { codeFrameColumns } from '@umijs/bundler-utils/compiled/babel/code-frame';
import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import { extname } from 'path';

export async function parseModule(opts: { content: string; path: string }) {
  await init;
  return parseModuleSync(opts);
}

export function parseModuleSync(opts: { content: string; path: string }) {
  let content = opts.content;

  if (opts.path.endsWith('.tsx') || opts.path.endsWith('.jsx')) {
    try {
      content = transformSync(content, {
        loader: extname(opts.path).slice(1) as Loader,
        format: 'esm',
      }).code;
    } catch (e) {
      // @ts-ignore
      prettyPrintEsBuildErrors(e.errors, opts);
      throw Error(`transform ${opts.path} failed`);
    }
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

type Errors = {
  location?: {
    line: number;
    column: number;
  };
  text: string;
}[];

function prettyPrintEsBuildErrors(
  errors: Errors = [],
  opts: { content: string; path: string },
) {
  for (const error of errors) {
    if (error.location?.line && error.location?.column) {
      // @ts-ignore
      const message = codeFrameColumns(
        opts.content,
        {
          start: {
            line: error.location.line,
            column: error.location.column,
          },
        },
        {
          message: error.text,
          highlightCode: true,
        },
      );
      console.log(`\n${opts.path}:\n${message}\n`);
    }
  }
}

export * from './proxy';
