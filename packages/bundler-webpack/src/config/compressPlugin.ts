import type { TransformOptions as EsbuildOpts } from '@umijs/bundler-utils/compiled/esbuild';
// @ts-ignore
import CSSMinimizerWebpackPlugin from '@umijs/bundler-webpack/compiled/css-minimizer-webpack-plugin';
import TerserPlugin, {
  type TerserOptions,
} from '../../compiled/terser-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import { EsbuildMinifyFix } from '../plugins/EsbuildMinifyFix';
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

  // esbuild transform only allow `string[]` as target
  const esbuildTarget = getEsBuildTarget({
    targets: userConfig.targets || {},
    jsMinifier,
  });
  // 提升 esbuild 压缩产物的兼容性，比如不出现 ?? 这种语法
  if (!esbuildTarget.includes('es2015')) {
    esbuildTarget.push('es2015');
  }

  let minify: any;
  let terserOptions: IConfig['jsMinifierOptions'];
  if (jsMinifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
    terserOptions = {
      target: esbuildTarget,
      // remove all comments
      legalComments: 'none',
    } as EsbuildOpts;
    // 解决 esbuild 压缩命名冲突 需要用户主动开启
    if (userConfig.esbuildMinifyIIFE) {
      config.plugin('EsbuildMinifyFix').use(EsbuildMinifyFix);
    }
  } else if (jsMinifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
    terserOptions = {
      format: {
        comments: false,
      },
    } as TerserOptions;
  } else if (jsMinifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
  } else if (jsMinifier === JSMinifier.uglifyJs) {
    minify = TerserPlugin.uglifyJsMinify;
    terserOptions = {
      output: {
        comments: false,
      },
    };
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
        extractComments: false,
        minify,
        terserOptions,
      },
    ] as any);
  }

  let cssMinify: any;
  let minimizerOptions: IConfig['cssMinifierOptions'];
  if (cssMinifier === CSSMinifier.esbuild) {
    cssMinify = CSSMinimizerWebpackPlugin.esbuildMinify;
    minimizerOptions = {
      target: esbuildTarget,
    } as EsbuildOpts;
  } else if (cssMinifier === CSSMinifier.cssnano) {
    cssMinify = CSSMinimizerWebpackPlugin.cssnanoMinify;
  } else if (cssMinifier === CSSMinifier.parcelCSS) {
    cssMinify = CSSMinimizerWebpackPlugin.lightningCssMinify;
  } else if (cssMinifier !== CSSMinifier.none) {
    throw new Error(`Unsupported cssMinifier ${userConfig.cssMinifier}.`);
  }
  minimizerOptions = {
    ...minimizerOptions,
    ...userConfig.cssMinifierOptions,
  };
  config.optimization
    .minimizer(`css-${cssMinifier}`)
    .use(CSSMinimizerWebpackPlugin, [
      {
        minify: cssMinify,
        minimizerOptions,
      },
    ]);
}
