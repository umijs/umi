// sort-object-keys
import type { Root } from '@hapi/joi';
import { CSSMinifier, JSMinifier, Transpiler } from './types';

const options = [
  'cheap-source-map',
  'cheap-eval-source-map',
  'cheap-hidden-source-map',
  'cheap-inline-source-map',
  'cheap-module-source-map',
  'cheap-module-eval-source-map',
  'cheap-module-hidden-source-map',
  'cheap-module-inline-source-map',
  'eval',
  'eval-source-map',
  'source-map',
  'hidden-source-map',
  'inline-source-map',
];

const DEVTOOL_REGEX = new RegExp(
  '^' + // start of string
    '(#@|@|#)?' + // maybe one of the pragmas
    `(${options.join('$|')})`, // one of the options
);

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    alias: (Joi) => Joi.object(),
    autoCSSModules: (Joi) => Joi.boolean(),
    autoprefixer: (Joi) => Joi.object(),
    chainWebpack: (Joi) => Joi.function(),
    copy: (Joi) =>
      Joi.array().items(
        Joi.alternatives().try(
          Joi.object({
            from: Joi.string(),
            to: Joi.string(),
          }),
          Joi.string(),
        ),
      ),
    cssLoader: (Joi) => Joi.object(),
    cssLoaderModules: (Joi) => Joi.object(),
    cssMinifier: (Joi) =>
      Joi.string().valid(
        CSSMinifier.cssnano,
        CSSMinifier.esbuild,
        CSSMinifier.parcelCSS,
        CSSMinifier.none,
      ),
    cssMinifierOptions: (Joi) => Joi.object(),
    deadCode: (Joi) => Joi.object(),
    define: (Joi) => Joi.object(),
    depTranspiler: (Joi) =>
      Joi.string().valid(
        Transpiler.babel,
        Transpiler.esbuild,
        Transpiler.swc,
        Transpiler.none,
      ),
    devtool: (Joi) =>
      Joi.alternatives().try(Joi.string().regex(DEVTOOL_REGEX), Joi.boolean()),
    esm: (Joi) => Joi.object(),
    externals: (Joi) =>
      Joi.alternatives().try(Joi.object(), Joi.string(), Joi.func()),
    extraBabelPlugins: (Joi) =>
      Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.array())),
    extraBabelPresets: (Joi) =>
      Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.array())),
    extraPostCSSPlugins: (Joi) => Joi.array(),
    fastRefresh: (Joi) => Joi.boolean(),
    forkTSChecker: (Joi) => Joi.object(),
    hash: (Joi) => Joi.boolean(),
    https: (Joi) => Joi.object(),
    ignoreMomentLocale: (Joi) => Joi.boolean(),
    inlineLimit: (Joi) => Joi.number(),
    jsMinifier: (Joi) =>
      Joi.string().valid(
        JSMinifier.esbuild,
        JSMinifier.swc,
        JSMinifier.terser,
        JSMinifier.uglifyJs,
        JSMinifier.none,
      ),
    jsMinifierOptions: (Joi) => Joi.object(),
    lessLoader: (Joi) => Joi.object(),
    manifest: (Joi) => Joi.object(),
    mdx: (Joi) =>
      Joi.object({
        loader: Joi.string(),
        loaderOptions: Joi.object(),
      }),
    mfsu: (Joi) =>
      Joi.alternatives(
        Joi.object({
          cacheDirectory: Joi.string(),
          chainWebpack: Joi.function(),
          esbuild: Joi.boolean(),
          mfName: Joi.string(),
        }),
        Joi.boolean(),
      ),
    outputPath: (Joi) => Joi.string(),
    postcssLoader: (Joi) => Joi.object(),
    proxy: (Joi) => Joi.object(),
    publicPath: (Joi) => Joi.string(),
    purgeCSS: (Joi) => Joi.object(),
    runtimePublicPath: (Joi) => Joi.object(),
    sassLoader: (Joi) => Joi.object(),
    srcTranspiler: (Joi) =>
      Joi.string().valid(
        Transpiler.babel,
        Transpiler.esbuild,
        Transpiler.swc,
        Transpiler.none,
      ),
    styleLoader: (Joi) => Joi.object(),
    svgo: (Joi) => Joi.alternatives().try(Joi.object(), Joi.boolean()),
    svgr: (Joi) => Joi.object(),
    targets: (Joi) => Joi.object(),
    theme: (Joi) => Joi.object(),
    writeToDisk: (Joi) => Joi.boolean(),
  };
}
