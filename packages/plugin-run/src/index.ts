import assert from 'assert';
import { fork } from 'child_process';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';
import { fsExtra, resolve } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'run',
    config: {
      schema({ zod }) {
        return zod.object({
          globals: zod.array(zod.string()).optional(),
        });
      },
    },
  });

  api.registerCommand({
    name: 'run',
    description: 'run the script commands, support for ts and zx',
    configResolveMode: 'loose',
    fn: ({ args }) => {
      const globals: string[] = api.config.run?.globals || [];
      const [scriptFilePath, ...restArgs] = args._;
      const absScriptFilePath = join(api.cwd, scriptFilePath);
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
      fork(tsxPath, [absTmpFilePath, ...restArgs], {
        stdio: 'inherit',
        env: {
          ...process.env,
          // disable `(node:92349) ExperimentalWarning: `--experimental-loader` may be removed in the future;` warning
          // more context: https://github.com/umijs/umi/pull/11981
          NODE_NO_WARNINGS: '1',
        },
      });
    },
  });
};

export function getBinPath() {
  // tsx does not export `package.json` subpath, use `resolve` instead of `require.resolve`
  const pkgPath = resolve.sync('tsx/package.json', { basedir: __dirname });
  const pkgContent = require(pkgPath);
  return join(dirname(pkgPath), pkgContent.bin);
}

export function getFileNameByPath(params: string) {
  return params.split('/').at(-1);
}
