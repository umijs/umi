import { init, parse } from 'es-module-lexer';

export async function getDepReExportContent(opts: {
  content: string;
  filePath?: string;
  importFrom: string;
}) {
  if (opts.filePath && /\.(css|less|scss|sass)$/.test(opts.filePath)) {
    return `import '${opts.importFrom}';`;
  }

  try {
    if (opts.filePath && !/\.(js|jsx|mjs|ts|tsx)$/.test(opts.filePath)) {
      const matchResult = opts.filePath.match(/\.([a-zA-Z]+)$/);
      throw new Error(
        `${matchResult ? matchResult[0] : 'file type'} not support!`,
      );
    }
    const { exports, isCJS } = await parseWithCJSSupport(opts.content);
    // cjs
    if (isCJS) {
      return [
        `import _ from '${opts.importFrom}';`,
        `export default _;`,
        `export * from '${opts.importFrom}';`,
      ].join('\n');
    }
    // esm
    else {
      const ret = [];
      let hasExports = false;
      if (exports.includes('default')) {
        ret.push(`import _ from '${opts.importFrom}';`);
        ret.push(`export default _;`);
        hasExports = true;
      }
      if (
        hasNonDefaultExports(exports) ||
        // export * from 不会有 exports，只会有 imports
        /export\s+\*\s+from/.test(opts.content)
      ) {
        ret.push(`export * from '${opts.importFrom}';`);
        hasExports = true;
      }

      if (!hasExports) {
        ret.push(`import '${opts.importFrom}';`);
      }

      return ret.join('\n');
    }
  } catch (e) {
    throw new Error(`Parse file ${opts.filePath || ''} failed, ${e.message}`);
  }
}

export const cjsModeEsmParser = (code: string) => {
  return [
    ...code.matchAll(
      /Object\.defineProperty\(\s*exports\s*\,\s*[\"|\'](\w+)[\"|\']/g,
    ),
  ]
    .map((result) => result[1])
    .concat(
      // Support export['default']
      // ref: https://unpkg.alibaba-inc.com/browse/echarts-for-react@2.0.16/lib/core.js
      [...code.matchAll(/exports(\.|\[(\'|\"))(\w+)(\s*|(\'|\")\])\s*\=/g)].map(
        (result) => {
          return result[Math.floor(result.length / 2)];
        },
      ),
    );
};

async function parseWithCJSSupport(content: string) {
  await init;
  const [imports, exports] = parse(content);
  let isCJS = !imports.length && !exports.length;
  let cjsEsmExports = null;
  if (isCJS) {
    cjsEsmExports = cjsModeEsmParser(content);
    if (cjsEsmExports.includes('__esModule')) {
      isCJS = false;
    }
  }
  return {
    exports: cjsEsmExports || exports,
    isCJS,
  };
}

function hasNonDefaultExports(exports: any) {
  return (
    exports.filter((exp: string) => !['__esModule', 'default'].includes(exp))
      .length > 0
  );
}
