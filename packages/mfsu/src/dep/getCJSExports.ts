export function getCJSExports({ content }: { content: string }) {
  return matchAll(
    /Object\.defineProperty\(\s*exports\s*\,\s*[\"|\'](\w+)[\"|\']/g,
    content,
  )
    .concat(
      // Support export['default']
      // ref: https://unpkg.alibaba-inc.com/browse/echarts-for-react@2.0.16/lib/core.js
      matchAll(
        /exports(?:\.|\[(?:\'|\"))(\w+)(?:\s*|(?:\'|\")\])\s*\=/g,
        content,
      ),
    )
    .concat(
      // Support __webpack_exports__["default"]
      // ref: https://github.com/margox/braft-editor/blob/master/dist/index.js#L8429
      matchAll(/__webpack_exports__\[(?:\"|\')(\w+)(?:\"|\')\]\s*\=/g, content),
    )
    .concat(
      // Support __webpack_require__.d(__webpack_exports, "EditorState")
      // ref: https://github.com/margox/braft-editor/blob/master/dist/index.js#L8347
      matchAll(
        /__webpack_require__\.d\(\s*__webpack_exports__\s*,\s*(?:\"|\')(\w+)(?:\"|\')\s*,/g,
        content,
      ),
    )
    .concat(
      // Support __webpack_require__.d(__webpack_exports__, {"default": function() { return /* binding */ clipboard; }});
      // ref: https://unpkg.alibaba-inc.com/browse/clipboard@2.0.8/dist/clipboard.js L26
      ...matchAll(
        /__webpack_require__\.d\(\s*__webpack_exports__\s*,\s*(\{)/g,
        content,
      ).map((matchResult) => {
        const { index } = matchResult;

        let idx = index;
        let deep = 0;
        let isMeetSymbol = false;
        let symbolBeginIndex = index;

        while (idx < content.length) {
          if (!deep && isMeetSymbol) {
            break;
          }
          if (content[idx] === '{') {
            if (!isMeetSymbol) {
              isMeetSymbol = true;
              symbolBeginIndex = idx;
            }
            deep++;
          }
          if (content[idx] === '}') {
            deep--;
          }
          idx++;
        }

        let result = content.slice(symbolBeginIndex, idx);

        return [
          ...matchAll(
            /(?:\"|\')(\w+)(?:\"|\')\s*\:\s*(?:function|\()/g,
            result,
          ),
        ];
      }),
    )
    .map((result) => result[1]);
}

function matchAll(regexp: RegExp, str: string) {
  const result = [];
  let match;
  while ((match = regexp.exec(str)) !== null) {
    result.push(match);
  }
  return result;
}
