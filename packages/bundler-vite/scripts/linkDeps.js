// vite cannot specific less implementation path, link less to bundler-utils to make sure it can be resolved
const fs = require('fs');
const path = require('path');
const target = path.dirname(require.resolve('@umijs/bundler-utils/compiled/less/package.json'));
const installDir = path.join(__dirname, '../node_modules');
const symlink = path.join(installDir, 'less');
const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';

if (fs.existsSync(symlink)) {
  // for multi-times install, in dev
  fs.unlinkSync(symlink);
} else if (!fs.existsSync(installDir)) {
  // for yarn-like install, no node_modules dir
  fs.mkdirSync(installDir);
}
fs.symlinkSync(target, symlink, symlinkType);
