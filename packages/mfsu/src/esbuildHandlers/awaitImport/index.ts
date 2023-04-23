import type { ImportSpecifier } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { checkMatch } from '../../babelPlugins/awaitImport/checkMatch';

interface IParams {
  cache: Map<string, any>;
  opts: any;
}

interface IOpts {
  code: string;
  imports: ImportSpecifier[];
  filePath: string;
}

export function getImportHandlerV4(params: {
  resolveImportSource: (source: string) => string;
}) {
  return function awaitImportHandler(opts: IOpts) {
    let offset = 0;

    let { code } = opts;
    const { imports } = opts;
    imports.forEach((i) => {
      if (!i.n) return;

      const isLazyImport = i.d > 0;
      const from = i.n;
      const replaceValue = params.resolveImportSource(from);
      if (replaceValue !== from) {
        // case: import x from './index.ts';
        //       import('./index.ts');

        // import x from '
        // import(
        const preSeg = code.substring(0, i.s + offset);
        // ';
        // );
        const tailSeg = code.substring(i.e + offset);
        const quote = isLazyImport ? '"' : '';
        code = `${preSeg}${quote}${replaceValue}${quote}${tailSeg}`;
        offset += replaceValue.length - from.length;
      }
    });

    return code;
  };
}

export default function getAwaitImportHandler(params: IParams) {
  return function awaitImportHandler(opts: IOpts) {
    let offset = 0;

    let { code } = opts;
    const { filePath, imports } = opts;
    imports.forEach((i) => {
      if (!i.n) return;

      const isLazyImport = i.d > 0;
      const from = i.n;
      const { isMatch, replaceValue } = checkMatch({
        cache: params.cache,
        value: from,
        opts: params.opts,
        filename: filePath,
      });
      if (isMatch) {
        // case: import x from './index.ts';
        //       import('./index.ts');

        // import x from '
        // import(
        const preSeg = code.substring(0, i.s + offset);
        // ';
        // );
        const tailSeg = code.substring(i.e + offset);
        const quote = isLazyImport ? '"' : '';
        code = `${preSeg}${quote}${replaceValue}${quote}${tailSeg}`;
        offset += replaceValue.length - from.length;
      }
    });

    if (params.cache.has(filePath)) {
      params.opts.onCollect?.({
        file: filePath,
        data: params.cache.get(filePath),
      });
    }

    return code;
  };
}
