import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
}

export async function addSVGRules(opts: IOpts) {
  const { config, userConfig } = opts;
  const { svgr, svgo = {} } = userConfig;
  if (svgr) {
    const svgrRule = config.module.rule('svgr');
    svgrRule
      .test(/\.svg$/i)
      .issuer(/\.[jt]sx?$/)
      .use('svgr-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/@svgr/webpack'))
      .options({
        svgoConfig: {
          ...(svgo || {}),
        },
        ...svgr,
        svgo: !!svgo,
      });
  }
  if (svgo === false) {
    const svgRule = config.module.rule('svg');
    svgRule
      .test(/\.svg$/)
      .use('url-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/url-loader'));
    return;
  }
  const svgRule = config.module.rule('svg');
  svgRule
    .test(/\.svg$/)
    .use('svgo-loader')
    .loader(require.resolve('@umijs/bundler-webpack/compiled/svgo-loader'))
    .options({ configFile: false, ...svgo })
    .end();
}
