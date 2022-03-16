import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'unocss',
    config: {
      schema(Joi) {
        return Joi.object({
          watch: Joi.array(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  const outputPath = 'uno.css';

  api.onBeforeCompiler(() => {
    /** 由于 @unocss/cli 对设置文件进行了检查，因此加入需要 unocss.config.ts 设置的提示
     * https://github.com/antfu/unocss/blob/main/packages/cli/src/index.ts#L93 */
    if (!existsSync(join(api.paths.cwd, 'unocss.config.ts')))
      api.logger.warn(
        '请在项目目录中添加 unocss.config.ts 文件，并配置需要的 unocss presets，否则插件将没有效果！',
      );

    const generatedPath = join(api.paths.absTmpPath, outputPath);
    const binPath = join(api.cwd, 'node_modules/.bin/unocss');
    const watchDirs = api.config.unocss.watch;

    /** 透过子进程建立 unocss 服务，将生成的 css 写入 generatedPath */
    const unocss = exec(
      `${binPath} ${watchDirs.join(' ')} --out-file ${generatedPath} ${
        api.env === 'development' ? '--watch' : ''
      }`,
      { cwd: api.cwd },
    );

    unocss.on('error', (m: any) => {
      api.logger.error('unocss service encounter an error: ' + m);
    });
  });

  /** 将生成的 css 文件加入到 import 中 */
  api.addEntryImports(() => {
    const generatedPath = winPath(join(api.paths.absTmpPath, outputPath));
    return [{ source: generatedPath }];
  });
};
