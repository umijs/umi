import { IApi } from '../../types';

interface ICrossOriginOpts {
  includes?: RegExp[];
}

export default (api: IApi) => {
  api.describe({
    key: 'crossorigin',
    config: {
      schema(Joi) {
        return Joi.alternatives(
          Joi.boolean(),
          Joi.object({
            include: Joi.array().items(Joi.object().instance(RegExp)),
          }),
        );
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.chainWebpack((webpackConfig) => {
    // https://webpack.js.org/configuration/output/#outputcrossoriginloading
    webpackConfig.output.crossOriginLoading('anonymous');
    return webpackConfig;
  });

  // last exec
  api.modifyHTML({
    fn: ($) => {
      const opts: ICrossOriginOpts = api.config.crossorigin || {};
      const includes = opts.includes || [];

      $('script').each((_i: number, elem) => {
        const el = $(elem);
        const scriptSrc = el.attr('src');
        if (!scriptSrc) {
          return;
        }
        // 在 local 的 script 标签上添加 crossorigin="anonymous"
        if (!/^(https?:)?\/\//.test(scriptSrc!)) {
          el.attr('crossorigin', 'anonymous');
        }
        if (includes.some((reg) => reg.test(scriptSrc))) {
          el.attr('crossorigin', 'anonymous');
        }
      });
      return $;
    },
    stage: Infinity,
  });
};
