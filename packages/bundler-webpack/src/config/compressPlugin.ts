// @ts-ignore
import CSSMinimizerWebpackPlugin from '@umijs/bundler-webpack/compiled/css-minimizer-webpack-plugin';
import TerserPlugin from '../../compiled/terser-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import ESBuildCSSMinifyPlugin from '../plugins/ESBuildCSSMinifyPlugin';
import { ParcelCSSMinifyPlugin } from '../plugins/ParcelCSSMinifyPlugin';
import { CSSMinifier, Env, IConfig, JSMinifier } from '../types';
import { getEsBuildTarget } from '../utils/getEsBuildTarget';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addCompressPlugin(opts: IOpts) {
  const { config, userConfig, env } = opts;
  const jsMinifier = userConfig.jsMinifier || JSMinifier.esbuild;
  const cssMinifier = userConfig.cssMinifier || CSSMinifier.esbuild;

  if (
    env === Env.development ||
    process.env.COMPRESS === 'none' ||
    (jsMinifier === JSMinifier.none && cssMinifier === CSSMinifier.none)
  ) {
    config.optimization.minimize(false);
    return;
  }
  config.optimization.minimize(true);

  let minify: any;
  let terserOptions: IConfig['jsMinifierOptions'];
  if (jsMinifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
    terserOptions = {
      target: getEsBuildTarget({
        targets: userConfig.targets || {},
      }),
    };
  } else if (jsMinifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
  } else if (jsMinifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
  } else if (jsMinifier === JSMinifier.uglifyJs) {
    minify = TerserPlugin.uglifyJsMinify;
  } else if (jsMinifier !== JSMinifier.none) {
    throw new Error(`Unsupported jsMinifier ${userConfig.jsMinifier}.`);
  }
  terserOptions = {
    ...terserOptions,
    ...userConfig.jsMinifierOptions,
  };
  if (jsMinifier !== JSMinifier.none) {
    config.optimization.minimizer(`js-${jsMinifier}`).use(TerserPlugin, [
      {
        minify,
        terserOptions,
      },
    ] as any);
  }

  if (cssMinifier === CSSMinifier.esbuild) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(ESBuildCSSMinifyPlugin, [userConfig.cssMinifierOptions]);
  } else if (cssMinifier === CSSMinifier.cssnano) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(CSSMinimizerWebpackPlugin, [
        {
          minimizerOptions: userConfig.cssMinifierOptions,
          parallel: true,
        },
      ]);
  } else if (cssMinifier === CSSMinifier.parcelCSS) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(ParcelCSSMinifyPlugin);
  } else if (cssMinifier !== CSSMinifier.none) {
    throw new Error(`Unsupported cssMinifier ${userConfig.cssMinifier}.`);
  }
}
