import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { transform } from '@umijs/bundler-utils/compiled/esbuild';
import { extname } from 'path';
import { getCJSExports } from './getCJSExports';

export async function getModuleExports({
  content,
  filePath,
}: {
  filePath: string;
  content: string;
}) {
  // Support tsx and jsx
  if (filePath && /\.(tsx|jsx)$/.test(filePath)) {
    content = (
      await transform(content, {
        sourcemap: false,
        sourcefile: filePath,
        format: 'esm',
        target: 'es6',
        loader: extname(filePath).slice(1) as 'tsx' | 'jsx',
      })
    ).code;
  }

  await init;
  const [imports, exports] = parse(content);
  let isCJS = !imports.length && !exports.length;
  let cjsEsmExports = null;
  if (isCJS) {
    cjsEsmExports = getCJSExports({ content });
    if (cjsEsmExports.includes('__esModule')) {
      isCJS = false;
    }
  }
  return {
    exports: cjsEsmExports || exports,
    isCJS,
  };
}
