import { logger } from '@umijs/utils';
import { exec } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import { IApi } from 'umi';

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

  api.onStart(() => {
    /** 由于 @unocss/cli 对设置文件进行了检查，因此加入需要 unocss.config.ts 设置的提示
     * https://github.com/antfu/unocss/blob/main/packages/cli/src/index.ts#L93 */
    if (!fs.existsSync(path.resolve(api.paths.cwd, 'unocss.config.ts')))
      logger.warn(
        '请在项目目录中添加 unocss.config.ts 文件，并配置需要的 unocss presets，否则插件将没有效果！',
      );

    const generatedPath = path.resolve(api.paths.absTmpPath, 'uno.css');
    const binPath = path.resolve(api.cwd, 'node_modules/.bin/unocss');
    const watchDirs = api.config.unocss.watch;

    /** 透过子进程建立 unocss 服务，将生成的 css 写入 generatedPath */
    const unocss = exec(
      `${binPath} ${watchDirs.join(' ')} --out-file ${generatedPath} --watch`,
      { cwd: api.cwd },
    );

    unocss.on('error', (m: any) => {
      api.logger.error('unocss service encounter an error: ' + m);
    });

    /** 将生成的 css 文件加入到 import 中 */
    api.addEntryImports(() => [{ source: generatedPath }]);
  });
};
