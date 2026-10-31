import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
  /**
   * When set (including ''), override file-loader `name` so SVGR URL fallbacks
   * honor staticPathPrefix. When omitted/undefined, keep file-loader's default
   * `[contenthash].[ext]` at the output root (pre-configurable-prefix behavior).
   */
  staticPathPrefix?: string;
}

export async function addSVGRules(opts: IOpts) {
  const { config, userConfig, staticPathPrefix } = opts;
  const { svgr, svgo = {} } = userConfig;
  if (svgr) {
    // file-loader ignores output.assetModuleFilename; only pass `name` when
    // staticPathPrefix was explicitly configured (including '').
    const urlLoaderOptions: {
      limit: IConfig['inlineLimit'];
      name?: string;
      fallback: string;
    } = {
      limit: userConfig.inlineLimit,
      fallback: require.resolve('@umijs/bundler-webpack/compiled/file-loader'),
    };
    if (staticPathPrefix !== undefined) {
      urlLoaderOptions.name = `${staticPathPrefix}[name].[hash:8].[ext]`;
    }
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
      .options(urlLoaderOptions)
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
