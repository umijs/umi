// vite cannot specific less implementation path, link less to bundler-utils to make sure it can be resolved
const fs = require('fs');
const path = require('path');
const target = path.dirname(require.resolve('@umijs/bundler-utils/compiled/less/package.json'));
const symlink = path.join(__dirname, '../node_modules/less');
const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';

if (fs.existsSync(symlink)) fs.unlinkSync(symlink);
fs.symlinkSync(target, symlink, symlinkType);
