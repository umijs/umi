import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'unocss',
    config: {
      schema({ zod }) {
        return zod.object({
          // 这个配置无用了，保留可选
          watch: zod.optional(zod.array(zod.any())),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onBeforeCompiler(async () => {
    if (process.env.IS_UMI_BUILD_WORKER) return;
    if (!!api.userConfig?.unocss?.watch) {
      api.logger.warn(
        'unocss?.watch 配置不再必要，请参考升级文档 https://umijs.org/docs/max/unocss#%E5%8D%87%E7%BA%A7%E6%8C%87%E5%8D%97-4070',
      );
    }

    // 不再使用 unocss cli 的方式，所以如果存在 unocss.config.ts 应该引导用户使用新的方式
    if (existsSync(join(api.paths.cwd, 'unocss.config.ts'))) {
      api.logger.warn(
        '请修改 unocss 的接入方式，主要是将 unocss.config.ts 修改为 uno.config.ts！移除 @unocss/cli。请参考升级文档 https://umijs.org/docs/max/unocss#%E5%8D%87%E7%BA%A7%E6%8C%87%E5%8D%97-4070',
      );
    }
  });

  api.modifyConfig((memo) => {
    // fix mfsu error
    memo.alias['uno.css'] = '/__uno.css';
    return memo;
  });

  api.chainWebpack(async (memo) => {
    const { default: UnoCSS } = await import('@unocss/webpack');
    memo.plugin('uno-css').use(UnoCSS);
    memo.optimization.realContentHash(true);
    return memo;
  });

  /** 将生成的 css 文件加入到 import 中 */
  api.addEntryImports(() => {
    return [{ source: 'uno.css' }];
  });
};
