import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
  staticPathPrefix: string;
}

export async function addSVGRules(opts: IOpts) {
  const { config, userConfig } = opts;
  const { svgr, svgo = {} } = userConfig;
  if (svgr) {
    const svgrRule = config.module.rule('svgr');
    svgrRule
      .test(/\.svg$/)
      .issuer(/\.[jt]sx?$/)
      .type('javascript/auto')
      .use('svgr-loader')
      .loader(require.resolve('../loader/svgr'))
      .options({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeTitle: false,
                },
              },
            },
            'prefixIds',
          ],
          ...svgo,
        },
        ...svgr,
        svgo: !!svgo,
      })
      .end()
      .use('url-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/url-loader'))
      .options({
        limit: userConfig.inlineLimit,
        fallback: require.resolve(
          '@umijs/bundler-webpack/compiled/file-loader',
        ),
      })
      .end();
  }
  if (svgo !== false) {
    const svgRule = config.module.rule('svg');
    svgRule
      .test(/\.svg$/)
      .use('svgo-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/svgo-loader'))
      .options({ configFile: false, ...svgo })
      .end();
  }
}
