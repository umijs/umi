import { fsExtra } from '@umijs/utils';
import { fork } from 'child_process';
import { dirname, extname, join, resolve } from 'path';
import { IApi } from 'umi';

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
      const runGlobals: string[] = api.config.run?.globals || [];
      const sourcePath = join(api.cwd, args._[0]);
      const str = fsExtra.readFileSync(sourcePath);
      const fileName = getFileNameByPath(sourcePath);
      check(fileName);
      api.writeTmpFile({
        path: fileName,
        content: `${runGlobals.map((item) => `import '${item}'\n`)}${str}`,
      });
      const scriptPath = join(api.paths.absTmpPath, `plugin-run/${fileName}`);
      const tsxPath = getBinPath();
      fork(tsxPath, [scriptPath], { stdio: 'inherit' });
    },
  });
};

export function check(name: string) {
  const ext = extname(name);
  if (ext !== 'ts') {
    throw new Error('Only typescript files can be run');
  }
}

export function getBinPath() {
  const pkgPath = join(__dirname, '../node_modules/tsx/package.json');
  const pkgContent = require(pkgPath);
  return resolve(dirname(pkgPath), pkgContent.bin);
}

export function getFileNameByPath(params: string) {
  const name = params.split('/').at(-1) || '';
  return name;
}
