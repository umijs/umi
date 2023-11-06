import { importLazy, logger, winPath } from '@umijs/utils';
import { init, parse } from '../compiled/es-module-lexer';
import { transformSync } from '../compiled/esbuild';

const babelCodeFrame: typeof import('../compiled/babel/code-frame') =
  importLazy(require.resolve('../compiled/babel/code-frame'));

export async function parseModule(opts: { content: string; path: string }) {
  await init;
  return parseModuleSync(opts);
}

export function parseModuleSync(opts: { content: string; path: string }) {
  let content = opts.content;

  if (opts.path.endsWith('.tsx') || opts.path.endsWith('.jsx')) {
    try {
      content = transformSync(content, {
        loader: 'tsx',
        format: 'esm',
      }).code;
    } catch (e) {
      // @ts-ignore
      prettyPrintEsBuildErrors(e.errors, opts);
      logger.error(`transform ${opts.path} failed`);
      throw e;
    }
  }

  try {
    return parse(content);
  } catch (e) {
    logger.error(`parse ${opts.path} failed`);
    throw e;
  }
}

export function isDepPath(path: string) {
  const umiMonorepoPaths = ['umi/packages/', 'umi-next/packages/'];

  return (
    path.includes('node_modules') ||
    umiMonorepoPaths.some((p) => winPath(path).includes(p))
  );
}

export * from './https';
export * from './proxy';
export * from './types';

type Errors = {
  location?: {
    line: number;
    column: number;
  };
  text: string;
}[];

export function prettyPrintEsBuildErrors(
  errors: Errors = [],
  opts: { content: string; path: string },
) {
  for (const error of errors) {
    if (error.location?.line && error.location?.column) {
      // @ts-ignore
      const message = babelCodeFrame.codeFrameColumns(
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
