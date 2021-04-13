const fs = require('fs');
const path = require('path');

const SCAN_PATH = path.join(__dirname, '../compiled/babel/bundle.js');

try {
  let fileString = fs.readFileSync(SCAN_PATH, 'utf8');
  const regexp = new RegExp(/(\r|\n)*?.*?__nccwpck_require__\(7905\) = utils;(.|\r|\n)*?__nccwpck_require__\(7905\) = fn;/);
  const targetStr = `
// change by scripts/fixBabelBundle.js
utils('is-plain-object', 'isObject');
utils('shallow-clone', 'clone');
utils('kind-of', 'typeOf');
__nccwpck_require__(27281);
  `;
  if (regexp.test(fileString) === true) {
    fileString = fileString.replace(regexp, targetStr);
    fs.writeFileSync(SCAN_PATH, fileString);
    console.log('babel build fixed! 手动修复的 babel 代码已完成。');
  } else {
    console.error('The code that needs to be repaired manually has changed, please confirm again.需要手动修复的代码已变更，请人工确认。')
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err);
}
