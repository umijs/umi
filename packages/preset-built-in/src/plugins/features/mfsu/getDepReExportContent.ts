import { init, parse } from 'es-module-lexer';
import { matchAll } from './utils';

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
  return matchAll(
    /Object\.defineProperty\(\s*exports\s*\,\s*[\"|\'](\w+)[\"|\']/g,
    code,
  )
    .concat(
      // Support export['default']
      // ref: https://unpkg.alibaba-inc.com/browse/echarts-for-react@2.0.16/lib/core.js
      matchAll(/exports(?:\.|\[(?:\'|\"))(\w+)(?:\s*|(?:\'|\")\])\s*\=/g, code),
    )
    .concat(
      // Support __webpack_exports__["default"]
      // ref: https://github.com/margox/braft-editor/blob/master/dist/index.js#L8429
      matchAll(/__webpack_exports__\[(?:\"|\')(\w+)(?:\"|\')\]\s*\=/g, code),
    )
    .concat(
      // Support __webpack_require__.d(__webpack_exports, "EditorState")
      // ref: https://github.com/margox/braft-editor/blob/master/dist/index.js#L8347
      matchAll(
        /__webpack_require__\.d\(\s*__webpack_exports__\s*,\s*(?:\"|\')(\w+)(?:\"|\')\s*,/g,
        code,
      ),
    )
    .concat(
      // Support __webpack_require__.d(__webpack_exports__, {"default": function() { return /* binding */ clipboard; }});
      // ref: https://unpkg.alibaba-inc.com/browse/clipboard@2.0.8/dist/clipboard.js L26
      ...matchAll(
        /__webpack_require__\.d\(\s*__webpack_exports__\s*,\s*(\{)/g,
        code,
      ).map((matchResult) => {
        const { index } = matchResult;

        let idx = index;
        let deep = 0;
        let isMeetSymbol = false;
        let symbolBeginIndex = index;

        while (idx < code.length) {
          if (!deep && isMeetSymbol) {
            break;
          }
          if (code[idx] === '{') {
            if (!isMeetSymbol) {
              isMeetSymbol = true;
              symbolBeginIndex = idx;
            }
            deep++;
          }
          if (code[idx] === '}') {
            deep--;
          }
          idx++;
        }

        let result = code.slice(symbolBeginIndex, idx);

        return [
          ...matchAll(
            /(?:\"|\')(\w+)(?:\"|\')\s*\:\s*(?:function|\(\)\=\>)/g,
            result,
          ),
        ];
      }),
    )
    .map((result) => result[1]);
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
