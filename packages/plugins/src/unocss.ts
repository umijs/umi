import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'unocss',
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

  const outputPath = 'uno.css';

  api.chainWebpack((memo: any) => {
    try {
      const UnocssWebpackPlugin = require('@unocss/webpack').default;
      memo.plugin('unocssPlugin').use(UnocssWebpackPlugin, [{}]);
    } catch (error) {
      api.logger.error('请在项目中添加@unocss/webpack依赖');
    }
  });

  api.modifyViteConfig((memo: any) => {
    try {
      const UnocssVitePlugin = require('unocss/vite').default;
      memo.plugins?.unshift(UnocssVitePlugin({}));
      return memo;
    } catch (error) {
      api.logger.error('请在项目中添加unocss依赖');
    }
  });

  api.modifyConfig((memo) => {
    if (api.isPluginEnable('mfsu')) {
      // mfsu默认开启时为undefined
      if (memo.mfsu === undefined) {
        memo.mfsu = {};
      }
      memo.mfsu.exclude = [...(memo.mfsu?.exclude || []), outputPath];
    }
    return memo;
  });

  /** 将生成的 css 文件加入到 import 中 */
  api.addEntryImports(() => {
    return [{ source: outputPath }];
  });
};
