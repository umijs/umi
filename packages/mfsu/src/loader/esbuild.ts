import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import {
  Loader as EsbuildLoader,
  transform as transformInternal,
} from '@umijs/bundler-utils/compiled/esbuild';
import { extname } from 'path';
import type { LoaderContext } from 'webpack';
import type { IEsbuildLoaderOpts } from '../types';

const LOADER_MAP = {
  // js
  js: 'js',
  cjs: 'js',
  mjs: 'js',
  jsx: 'jsx',
  cjsx: 'jsx',
  mjsx: 'jsx',
  // ts
  ts: 'ts',
  cts: 'ts',
  mts: 'ts',
  tsx: 'tsx',
  ctsx: 'tsx',
  mtsx: 'tsx',
} satisfies Record<string, EsbuildLoader>;

async function esbuildTranspiler(
  this: LoaderContext<IEsbuildLoaderOpts>,
  source: string,
): Promise<void> {
  const done = this.async();
  const options: IEsbuildLoaderOpts = this.getOptions();
  const { handler = [], implementation, ...otherOptions } = options;
  const transform = implementation?.transform || transformInternal;

  const filePath = this.resourcePath;

  const ext = extname(filePath).slice(1) as keyof typeof LOADER_MAP;
  const loader = LOADER_MAP[ext] ?? 'default';

  const transformOptions = {
    ...otherOptions,
    target: options.target ?? 'es2015',
    loader: loader as EsbuildLoader,
    sourcemap: this.sourceMap,
    sourcefile: filePath,
  };

  try {
    let { code, map } = await transform(source, transformOptions);

    if (handler.length) {
      await init;
      handler.forEach((handle) => {
        const [imports, exports] = parse(code);
        code = handle({ code, imports, exports, filePath });
      });
    }

    done(null, code, map && JSON.parse(map));
  } catch (error: unknown) {
    done(error as Error);
  }
}

export default esbuildTranspiler;
export const esbuildLoader = __filename;
