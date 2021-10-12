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
  const { svgr, svgo } = userConfig;
  if (svgr) {
    // https://react-svgr.com/docs/webpack/#handle-svg-in-css-sass-or-less
    // https://github.com/gregberge/svgr/issues/551#issuecomment-883073902
    // https://github.com/webpack/webpack/issues/9309
    const svgrRule = config.module.rule('svgr');
    svgrRule
      .test(/\.svg$/)
      .issuer(/\.[jt]sx?$/)
      .type('javascript/auto')
      .use('babel-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/babel-loader'))
      .end()
      .use('svgr-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/@svgr/webpack'))
      .options({
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
        ...svgr,
        svgo,
      })
      .end()
      .use('url-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/url-loader'))
      .end();
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
