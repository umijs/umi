import path from 'path';
import { eachPkg, getPkgs } from './utils';

const cwd = process.cwd();
eachPkg(getPkgs(), (opts) => {
  console.log('Checking package:', opts.pkg);
  const pkg = require(path.join(cwd, 'packages', opts.pkg, 'package.json'));
  pkg.files;
  // TODO
  // 检测 pkg.files 是否包含必要的和当前 pkg 下的文件和目录
});
