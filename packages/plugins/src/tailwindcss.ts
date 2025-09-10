import assert from 'assert';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';
import { crossSpawn, semver, winPath } from 'umi/plugin-utils';
import { resolveProjectDep } from './utils/resolveProjectDep';

const CHECK_INTERVAL = 300;
const CHECK_TIMEOUT = process.env.CHECK_TIMEOUT
  ? parseInt(process.env.CHECK_TIMEOUT, 10)
  : 5;

const TW_NAME = 'tailwindcss';
const TW_CLI_NAME = '@tailwindcss/cli';

export default (api: IApi) => {
  api.describe({
    key: 'tailwindcss',
    config: {
      schema({ zod }) {
        return zod.record(zod.any());
      },
    },
    enableBy: api.EnableBy.config,
  });

  let tailwind: any = null;
  const outputPath = 'plugin-tailwindcss/tailwind.css';

  api.onBeforeCompiler(() => {
    const inputPath = join(api.cwd, 'tailwind.css');
    const generatedPath = join(api.paths.absTmpPath, outputPath);
    const binPath = getTailwindBinPath(api);
    const configPath = join(api.cwd, 'tailwind.config.js');

    if (process.env.IS_UMI_BUILD_WORKER) {
      return;
    }

    return new Promise<void>((resolve) => {
      /** 透过子进程建立 tailwindcss 服务，将生成的 css 写入 generatedPath */
      tailwind = crossSpawn(
        `${binPath}`,
        [
          '-c',
          configPath,
          '-i',
          inputPath,
          '-o',
          generatedPath,
          api.env === 'development' ? '--watch' : '',
        ],
        {
          stdio: 'inherit',
          cwd: process.env.APP_ROOT || api.cwd,
        },
      );
      tailwind.on('error', (m: any) => {
        api.logger.error('tailwindcss service encounter an error: ' + m);
      });
      if (api.env === 'production') {
        tailwind.on('exit', () => {
          api.logger.info('tailwindcss service exited');
          resolve();
        });
      } else {
        api.logger.info('tailwindcss service started');
        // wait for generatedPath to be created by interval
        const interval = setInterval(() => {
          if (existsSync(generatedPath)) {
            clearInterval(interval);
            resolve();
          }
        }, CHECK_INTERVAL);
        // throw error if not generated after 5s
        const timer = setTimeout(() => {
          if (!existsSync(generatedPath)) {
            clearInterval(timer);
            api.logger.error(
              `tailwindcss generate failed after ${CHECK_TIMEOUT} seconds, please check your tailwind.css and tailwind.config.js`,
            );
            process.exit(1);
          }
        }, CHECK_TIMEOUT * 1000);
      }
    });
  });

  /** 将生成的 css 文件加入到 import 中 */
  api.addEntryImports(() => {
    const generatedPath = winPath(join(api.paths.absTmpPath, outputPath));
    return [{ source: generatedPath }];
  });
};

// v3: https://v3.tailwindcss.com/docs/installation
function detectLegacyTailwindPath(api: IApi) {
  const localPath = resolveProjectDep({
    pkg: api.pkg,
    cwd: api.cwd,
    dep: TW_NAME,
  });

  return localPath
    ? winPath(localPath)
    : dirname(require.resolve(`${TW_NAME}/package.json`));
}

// v4: https://tailwindcss.com/docs/upgrade-guide#using-tailwind-cli
function detectTailwindCLIPath(api: IApi) {
  const localPath = resolveProjectDep({
    pkg: api.pkg,
    cwd: api.cwd,
    dep: TW_CLI_NAME,
  });

  return localPath
    ? winPath(localPath)
    : dirname(require.resolve(`${TW_CLI_NAME}/package.json`));
}

function getTailwindBinPath(api: IApi) {
  const twPath = detectLegacyTailwindPath(api);
  const twPkgPath = join(twPath, 'package.json');
  const twPkg = require(twPkgPath);
  const version = twPkg.version;

  assert(
    version && semver.valid(version),
    `tailwindcss version not found, please install tailwindcss first`,
  );

  if (semver.major(version) === 3) {
    return join(twPath, twPkg.bin.tailwind);
  }

  if (semver.major(version) === 4) {
    const cliPath = detectTailwindCLIPath(api);
    const cliPkg = require(join(cliPath, 'package.json'));
    return join(cliPath, cliPkg.bin.tailwindcss);
  }
}
