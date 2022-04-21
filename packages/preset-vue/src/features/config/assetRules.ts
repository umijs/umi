import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from 'umi';

interface IOpts {
  config: Config;
  api: IApi;
}

export async function addAssetRules({ config, api }: IOpts) {
  // bundler-webpack 本身自带的静态资源会触发 vue-loader currently does not support vue rules with oneOf. 需要禁用掉
  config.module.rules.delete('asset');

  const { userConfig } = api;

  const inlineLimit = parseInt(userConfig.inlineLimit || '10000', 10);

  const staticPathPrefix =
    api.config.staticPathPrefix !== undefined
      ? api.config.staticPathPrefix
      : 'static/';

  config.module
    .rule('avif')
    .test(/\.avif$/)
    .type('asset')
    .mimetype('image/avif')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: `${staticPathPrefix}[name].[hash:8].[ext]`,
    });

  config.module
    .rule('image')
    .test(/\.(bmp|gif|jpg|jpeg|png)$/)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: `${staticPathPrefix}[name].[hash:8].[ext]`,
    });
}
