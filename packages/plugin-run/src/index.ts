import { fsExtra, winPath } from '@umijs/utils';
import { fork } from 'child_process';
import { dirname, join, resolve } from 'path';
import { IApi } from 'umi';

function winJoin(...args: string[]) {
  return winPath(join(...args));
}

export default (api: IApi) => {
  api.describe({
    key: 'run',
    config: {
      schema(Joi) {
        return Joi.object({
          globals: Joi.array().items(Joi.string()),
        });
      },
    },
  });
  api.registerCommand({
    name: 'run',
    fn: ({ args }) => {
      const cwd = process.cwd();
      const runGlobals: string[] = api?.config?.run?.globals || [];
      const sourcePath = join(cwd, args._[0]);
      const src = winJoin(cwd, 'src');
      const absSrcPath =
        fsExtra.existsSync(src) && fsExtra.statSync(src).isDirectory()
          ? src
          : cwd;
      const str = fsExtra.readFileSync(sourcePath);
      const fileName = getFileNameByPath(sourcePath);
      api.writeTmpFile({
        path: fileName,
        content: `${runGlobals.map((item) => `import '${item}'\n`)}${str}`,
      });
      const scriptPath = winJoin(absSrcPath, `.umi/plugin-run/${fileName}`);
      const tsxPath = getBinPath();
      fork(tsxPath, [scriptPath], { stdio: 'inherit' });
    },
  });
};

function getBinPath() {
  try {
    const pkgPath = join(__dirname, '../node_modules/tsx/package.json');
    const pkgContent = require(pkgPath);
    return resolve(dirname(pkgPath), pkgContent.bin);
  } catch (e) {
    throw new Error(`tsx not found, please install it first.`);
  }
}

function getFileNameByPath(params: string) {
  const name = params.split('/').at(-1) || '';
  return name;
}
