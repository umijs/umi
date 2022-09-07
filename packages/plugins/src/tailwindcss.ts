import { join, dirname } from 'path';
import { IApi } from 'umi';
import { crossSpawn, winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'tailwindcss',
    config: {
      schema(Joi) {
        return Joi.alternatives().try(
          Joi.object(),
          Joi.boolean().invalid(true),
        );
      },
    },
    enableBy: api.EnableBy.config,
  });

  let tailwind: any = null;
  const outputPath = 'plugin-tailwindcss/tailwind.css';

  api.onBeforeCompiler(() => {
    const inputPath = join(api.cwd, 'tailwind.css');
    const generatedPath = join(api.paths.absTmpPath, outputPath);
    const binPath = getTailwindBinPath({ cwd: api.cwd });
    const configPath = join(
      process.env.APP_ROOT || api.cwd,
      'tailwind.config.js',
    );

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
        resolve();
      }
    });
  });

  /** 将生成的 css 文件加入到 import 中 */
  api.addEntryImports(() => {
    const generatedPath = winPath(join(api.paths.absTmpPath, outputPath));
    return [{ source: generatedPath }];
  });
};

function getTailwindBinPath(opts: { cwd: string }) {
  const pkgPath = require.resolve('tailwindcss/package.json', {
    paths: [opts.cwd],
  });
  const tailwindPath = require(pkgPath).bin['tailwind'];
  return join(dirname(pkgPath), tailwindPath);
}
