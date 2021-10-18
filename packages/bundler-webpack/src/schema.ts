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

export function getSchemas(): Record<string, (joi: Root) => any> {
  return {
    alias: (joi) => joi.object(),
    chainWebpack: (joi) => joi.function(),
    copy: (joi) =>
      joi.array().items(
        joi.alternatives().try(
          joi.object({
            from: joi.string(),
            to: joi.string(),
          }),
          joi.string(),
        ),
      ),
    cssLoader: (joi) => joi.object(),
    cssLoaderModules: (joi) => joi.object(),
    cssMinifier: (joi) =>
      joi
        .string()
        .valid(CSSMinifier.cssnano, CSSMinifier.esbuild, CSSMinifier.none),
    cssMinifierOptions: (joi) => joi.object(),
    define: (joi) => joi.object(),
    depTranspiler: (joi) =>
      joi
        .string()
        .valid(
          Transpiler.babel,
          Transpiler.esbuild,
          Transpiler.swc,
          Transpiler.none,
        ),
    devtool: (joi) =>
      joi.alternatives().try(joi.string().regex(DEVTOOL_REGEX), joi.boolean()),
    externals: (joi) =>
      joi
        .alternatives()
        .try(
          joi
            .object()
            .pattern(/.+/, [
              joi.string(),
              joi.boolean(),
              joi.object().pattern(/.+/, [joi.string(), joi.boolean()]),
            ]),
          joi.string(),
          joi.func().arity(3),
          joi.object().regex(),
        ),
    extraBabelPlugins: (joi) =>
      joi
        .alternatives()
        .try(
          joi.string(),
          joi.array().items(joi.alternatives().try(joi.string(), joi.object())),
        ),
    extraBabelPresets: (joi) =>
      joi
        .alternatives()
        .try(
          joi.string(),
          joi.array().items(joi.alternatives().try(joi.string(), joi.object())),
        ),
    extraPostCSSPlugins: (joi) => joi.array(),
    hash: (joi) => joi.boolean(),
    ignoreMomentLocale: (joi) => joi.boolean(),
    jsMinifier: (joi) =>
      joi
        .string()
        .valid(
          JSMinifier.esbuild,
          JSMinifier.swc,
          JSMinifier.terser,
          JSMinifier.uglifyJs,
          JSMinifier.none,
        ),
    jsMinifierOptions: (joi) => joi.object(),
    lessLoader: (joi) => joi.object(),
    outputPath: (joi) => joi.string(),
    postcssLoader: (joi) => joi.object(),
    proxy: (joi) => joi.object(),
    publicPath: (joi) => joi.string(),
    purgeCSS: (joi) => joi.object(),
    sassLoader: (joi) => joi.object(),
    srcTranspiler: (joi) =>
      joi
        .string()
        .valid(
          Transpiler.babel,
          Transpiler.esbuild,
          Transpiler.swc,
          Transpiler.none,
        ),
    styleLoader: (joi) => joi.object(),
    svgr: (joi) => joi.object(),
    svgo: (joi) => joi.alternatives().try(joi.object(), joi.boolean()),
    targets: (joi) => joi.object(),
    writeToDisk: (joi) => joi.boolean(),
  };
}
