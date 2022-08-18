import { fsExtra } from '@umijs/utils';
import { fork } from 'child_process';
import { dirname, join, resolve } from 'path';
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
      api.writeTmpFile({
        path: fileName,
        content: `${runGlobals.map((item) => `import '${item}'\n`)}${str}`,
        tplPath: sourcePath,
      });
      const scriptPath = join(api.paths.absTmpPath, `plugin-run/${fileName}`);
      const tsxPath = getBinPath();
      fork(tsxPath, [scriptPath], { stdio: 'inherit' });
    },
  });
};

function getBinPath() {
  const pkgPath = join(__dirname, '../node_modules/tsx/package.json');
  const pkgContent = require(pkgPath);
  return resolve(dirname(pkgPath), pkgContent.bin);
}

function getFileNameByPath(params: string) {
  const name = params.split('/').at(-1) || '';
  return name;
}
