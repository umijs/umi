import { join } from 'path';
import { existsSync } from 'fs';
import assert from 'assert';
export default function(api, opts = {}) {
  const { paths } = api.service;
  const { winPath } = api.utils;
  function checkFile(file) {
    assert(typeof file === 'string', 'polyfill extend must be a string');
    if (!file.startsWith('.')) {
      return file;
    } else if (existsSync(file)) {
      return file;
    } else if (existsSync(join(paths.cwd, file))) {
      return join(paths.cwd, file);
    }
    return '';
  }
  let extendFile = '';
  if (opts.extend) {
    assert(
      typeof opts.extend === 'object' && opts.extend.length,
      'extend must be an array',
    );
    opts.extend.map(item => {
      let fileName = checkFile(item);
      if (fileName) {
        extendFile += `import '${winPath(fileName)}';\r\n`;
      }
      return item;
    });
  }
  api.register('modifyEntryFile', ({ memo }) => {
    memo = `import 'umi-plugin-polyfills/lib/global.js';\r\n${extendFile}${memo}`;
    return memo;
  });
}
