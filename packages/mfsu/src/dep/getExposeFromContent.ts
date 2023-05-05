import { isJavaScriptFile, winPath } from '@umijs/utils';
import assert from 'assert';
import { basename } from 'path';
import { Dep } from './dep';
import { getModuleExports } from './getModuleExports';

export async function getExposeFromContent(opts: {
  dep: Dep;
  filePath: string;
  content: string;
}) {
  const importPath = winPath(opts.filePath);

  // Support CSS
  if (
    opts.filePath &&
    /\.(css|less|scss|sass|stylus|styl)$/.test(opts.filePath)
  ) {
    return `import '${importPath}';`;
  }

  // wasm
  // export default   is for normal use to get a link
  // export namespace is for experiments asyncWebAssembly or syncWebAssembly
  if (opts.filePath?.endsWith('.wasm')) {
    return `
import _ from '${importPath}';
export default _; 
export * from '${importPath}';`.trim();
  }

  // Support Assets Files
  if (
    opts.filePath &&
    /\.(json|svg|png|jpe?g|avif|gif|webp|ico|eot|woff|woff2|ttf|txt|text|mdx?)$/.test(
      opts.filePath,
    )
  ) {
    return `
import _ from '${importPath}';
export default _;`.trim();
  }

  assert(
    isJavaScriptFile(opts.filePath),
    `file type not supported for ${basename(opts.filePath)}.`,
  );
  const { exports, isCJS } = await getModuleExports({
    content: opts.content,
    filePath: opts.filePath,
  });
  // cjs
  if (isCJS) {
    return [
      `import _ from '${importPath}';`,
      `export default _;`,
      `export * from '${importPath}';`,
    ].join('\n');
  }
  // esm
  else {
    const ret = [];
    let hasExports = false;
    if (exports.includes('default')) {
      ret.push(`import _ from '${importPath}';`);
      ret.push(`export default _;`);
      hasExports = true;
    }
    if (
      hasNonDefaultExports(exports) ||
      // export * from 不会有 exports，只会有 imports
      // case: export*from'.'
      //       export * from '.'
      /export\s*\*\s*from/.test(opts.content)
    ) {
      ret.push(`export * from '${importPath}';`);
      hasExports = true;
    }

    if (!hasExports) {
      // 只有 __esModule 的全量导出
      if (exports.includes('__esModule')) {
        ret.push(`import _ from '${importPath}';`);
        ret.push(`export default _;`);
        ret.push(`export * from '${importPath}';`);
      } else {
        ret.push(`import '${importPath}';`);
      }
    }

    return ret.join('\n');
  }
}

function hasNonDefaultExports(exports: any) {
  return (
    exports.filter((exp: string) => !['__esModule', 'default'].includes(exp))
      .length > 0
  );
}
