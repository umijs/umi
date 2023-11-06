// sort-object-keys
import type { z } from '@umijs/utils/compiled/zod';
import { CSSMinifier, JSMinifier, Transpiler } from './types';

const devTool = [
  'cheap-source-map',
  'cheap-module-source-map',
  'eval',
  'eval-source-map',
  'eval-cheap-source-map',
  'eval-cheap-module-source-map',
  'eval-nosources-cheap-source-map',
  'eval-nosources-cheap-module-source-map',
  'eval-nosources-source-map',
  'source-map',
  'hidden-source-map',
  'hidden-nosources-cheap-source-map',
  'hidden-nosources-cheap-module-source-map',
  'hidden-nosources-source-map',
  'hidden-cheap-source-map',
  'hidden-cheap-module-source-map',
  'inline-source-map',
  'inline-cheap-source-map',
  'inline-cheap-module-source-map',
  'inline-nosources-cheap-source-map',
  'inline-nosources-cheap-module-source-map',
  'inline-nosources-source-map',
  'nosources-source-map',
  'nosources-cheap-source-map',
  'nosources-cheap-module-source-map',
];

export function getSchemas(): Record<string, (arg: { zod: typeof z }) => any> {
  return {
    alias: ({ zod }) => zod.record(zod.string(), zod.any()),
    autoCSSModules: ({ zod }) => zod.boolean(),
    autoprefixer: ({ zod }) => zod.record(zod.string(), zod.any()),
    babelLoaderCustomize: ({ zod }) => zod.string(),
    cacheDirectoryPath: ({ zod }) => zod.string(),
    chainWebpack: ({ zod }) => zod.function(),
    checkDepCssModules: ({ zod }) => zod.boolean().default(false),
    copy: ({ zod }) =>
      zod.array(
        zod.union([
          zod.object({
            from: zod.string(),
            to: zod.string(),
          }),
          zod.string(),
        ]),
      ),
    cssLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    cssLoaderModules: ({ zod }) => zod.record(zod.string(), zod.any()),
    cssMinifier: ({ zod }) =>
      zod.enum([
        CSSMinifier.cssnano,
        CSSMinifier.esbuild,
        CSSMinifier.parcelCSS,
        CSSMinifier.none,
      ]),
    cssMinifierOptions: ({ zod }) => zod.record(zod.string(), zod.any()),
    cssPublicPath: ({ zod }) => zod.string(),
    deadCode: ({ zod }) =>
      zod
        .object({
          context: zod.string(),
          detectUnusedExport: zod.boolean(),
          detectUnusedFiles: zod.boolean(),
          exclude: zod.array(zod.string()),
          failOnHint: zod.boolean(),
          patterns: zod.array(zod.string()),
        })
        .deepPartial(),
    define: ({ zod }) => zod.record(zod.string(), zod.any()),
    depTranspiler: ({ zod }) =>
      zod.enum([
        Transpiler.babel,
        Transpiler.esbuild,
        Transpiler.swc,
        Transpiler.none,
      ]),
    devtool: ({ zod }) => zod.union([zod.enum(devTool as any), zod.boolean()]),
    esm: ({ zod }) => zod.object({}),
    externals: ({ zod }) =>
      zod.union([
        zod.record(zod.string(), zod.any()),
        zod.string(),
        zod.function(),
      ]),
    extraBabelIncludes: ({ zod }) =>
      zod.array(zod.union([zod.string(), zod.instanceof(RegExp)])),
    extraBabelPlugins: ({ zod }) =>
      zod.array(zod.union([zod.string(), zod.array(zod.any())])),
    extraBabelPresets: ({ zod }) =>
      zod.array(zod.union([zod.string(), zod.array(zod.any())])),
    extraPostCSSPlugins: ({ zod }) => zod.array(zod.any()),
    fastRefresh: ({ zod }) => zod.boolean(),
    forkTSChecker: ({ zod }) => zod.record(zod.string(), zod.any()),
    hash: ({ zod }) => zod.boolean(),
    https: ({ zod }) =>
      zod
        .object({
          cert: zod.string(),
          hosts: zod.array(zod.string()),
          http2: zod.boolean(),
          key: zod.string(),
        })
        .deepPartial(),
    ignoreMomentLocale: ({ zod }) => zod.boolean(),
    inlineLimit: ({ zod }) => zod.number(),
    jsMinifier: ({ zod }) =>
      zod.enum([
        JSMinifier.esbuild,
        JSMinifier.swc,
        JSMinifier.terser,
        JSMinifier.uglifyJs,
        JSMinifier.none,
      ]),
    jsMinifierOptions: ({ zod }) => zod.record(zod.string(), zod.any()),
    lessLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    manifest: ({ zod }) =>
      zod
        .object({
          basePath: zod.string(),
          fileName: zod.string(),
        })
        .deepPartial(),
    mdx: ({ zod }) =>
      zod
        .object({
          loader: zod.string(),
          loaderOptions: zod.record(zod.string(), zod.any()),
        })
        .deepPartial(),
    mfsu: ({ zod }) =>
      zod.union([
        zod
          .object({
            cacheDirectory: zod.string(),
            chainWebpack: zod.function(),
            esbuild: zod.boolean(),
            exclude: zod.array(
              zod.union([zod.string(), zod.instanceof(RegExp)]),
            ),
            include: zod.array(zod.string()),
            mfName: zod.string(),
            remoteAliases: zod.array(zod.string()),
            remoteName: zod.string(),
            runtimePublicPath: zod.boolean(),
            shared: zod.record(zod.string(), zod.any()),
            strategy: zod.enum(['eager', 'normal']).default('normal'),
          })
          .deepPartial(),
        zod.boolean(),
      ]),
    normalCSSLoaderModules: ({ zod }) => zod.record(zod.string(), zod.any()),
    outputPath: ({ zod }) => zod.string(),
    postcssLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    proxy: ({ zod }) =>
      zod.union([zod.record(zod.string(), zod.any()), zod.array(zod.any())]),
    publicPath: ({ zod }) => zod.string(),
    purgeCSS: ({ zod }) => zod.record(zod.string(), zod.any()),
    runtimePublicPath: ({ zod }) => zod.object({}),
    sassLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    srcTranspiler: ({ zod }) =>
      zod.enum([Transpiler.babel, Transpiler.esbuild, Transpiler.swc]),
    srcTranspilerOptions: ({ zod }) =>
      zod
        .object({
          esbuild: zod.record(zod.string(), zod.any()),
          swc: zod.record(zod.string(), zod.any()),
        })
        .deepPartial(),
    styleLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    stylusLoader: ({ zod }) => zod.record(zod.string(), zod.any()),
    svgo: ({ zod }) =>
      zod.union([zod.record(zod.string(), zod.any()), zod.boolean()]),
    svgr: ({ zod }) => zod.record(zod.string(), zod.any()),
    targets: ({ zod }) => zod.record(zod.string(), zod.any()),
    theme: ({ zod }) => zod.record(zod.string(), zod.any()),
    writeToDisk: ({ zod }) => zod.boolean(),
  };
}
