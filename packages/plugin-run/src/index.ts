import assert from 'assert';
import { fork } from 'child_process';
import { writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { IApi } from 'umi';
import { fsExtra } from 'umi/plugin-utils';

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
      const globals: string[] = api.config.run?.globals || [];
      const absScriptFilePath = join(api.cwd, args._[0]);
      const fileName = getFileNameByPath(absScriptFilePath);
      assert(fileName, `${absScriptFilePath} is not a valid file`);
      assert(
        /\.([jt])s$/.test(fileName),
        `${fileName} is not a valid js or ts file`,
      );
      const absTmpFilePath = join(
        api.paths.absNodeModulesPath,
        '.cache',
        'umi-plugin-run',
        fileName,
      );
      fsExtra.mkdirpSync(dirname(absTmpFilePath));
      writeFileSync(
        absTmpFilePath,
        `${globals.map(
          (item) => `import '${item}'\n`,
        )}import '${absScriptFilePath}';`,
        'utf-8',
      );
      const tsxPath = getBinPath();
      fork(tsxPath, [absTmpFilePath], { stdio: 'inherit' });
    },
  });
};

export function getBinPath() {
  const pkgPath = join(__dirname, '../node_modules/tsx/package.json');
  const pkgContent = require(pkgPath);
  return resolve(dirname(pkgPath), pkgContent.bin);
}

export function getFileNameByPath(params: string) {
  return params.split('/').at(-1);
}
