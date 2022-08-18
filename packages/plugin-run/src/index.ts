import { fork } from 'child_process';
import path from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.registerCommand({
    name: 'run',
    fn: ({ args }) => {
      const cwd = process.cwd();
      const scriptPath = path.join(cwd, args._[0]);
      const tsxPath = getBinPath();
      fork(tsxPath, [scriptPath], { stdio: 'inherit' });
    },
  });
};

function getBinPath() {
  try {
    const pkgPath = path.join(__dirname, '../node_modules/tsx/package.json');
    const pkgContent = require(pkgPath);
    return path.resolve(path.dirname(pkgPath), pkgContent.bin);
  } catch (e) {
    throw new Error(`tsx not found, please install it first.`);
  }
}
