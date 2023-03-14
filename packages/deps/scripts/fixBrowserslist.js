const fs = require('fs');
const path = require('path');

const BABEL_PATH = path.join(__dirname, '../compiled/babel/bundle.js');
const WEBPACK_PATH = path.join(__dirname, '../compiled/webpack/5/bundle5.js');

function fixBrowserslist(target) {
  const content = fs.readFileSync(target, 'utf-8');
  const match = content.match(
    /require\(__(webpack|nccwpck)_require__\((\d*)\).resolve/,
  );
  try {
    if (match) {
      fs.writeFileSync(
        target,
        content.replace(
          new RegExp(`__${match[1]}_require__\\(${match[2]}\\)`, 'gm'),
          'require',
        ),
      );
      console.log(
        `browserslist build fixed! 手动修复 ${target} 文件内的 browserslist 代码已完成。`,
      );
    } else {
      console.error(
        `The browserslist code that needs to be manually repaired in the ${target} file has changed. Please confirm it manually. \n${BABEL_PATH} 文件内需要手动修复的 browserslist 代码已变更，请人工确认。`,
      );
    }
  } catch (err) {
    console.log(err);
  }
}

fixBrowserslist(BABEL_PATH);
fixBrowserslist(WEBPACK_PATH);
