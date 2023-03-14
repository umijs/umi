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

const DevToolValues: any = devTool
  .concat(devTool.map((item) => `#${item}`))
  .concat(devTool.map((item) => `@${item}`))
  .concat(devTool.map((item) => `#@${item}`));

export function getSchemas(): Record<string, ({}: { zod: typeof z }) => any> {
  return {
    alias: ({ zod }) =>
      zod
        .record(zod.string())
        .describe('配置别名，对 import 语句的 source 做映射。'),
    autoCSSModules: ({ zod }) =>
      zod
        .boolean()
        .describe(
          '是否自动开启 CSS Modules，如果开启，会将所有 CSS 文件视为 CSS Modules 模块。',
        ),
    autoprefixer: ({ zod }) =>
      zod
        .record(zod.any())
        .describe(
          '用于解析 CSS 并使用来自 Can I Use 的值将供应商前缀添加到 CSS 规则。如自动给 CSS 添加 -webkit- 前缀。\n更多配置，请查阅 autoprefixer 的配置项。',
        ),
    babelLoaderCustomize: ({ zod }) => zod.string(),
    cacheDirectoryPath: ({ zod }) =>
      zod
        .string()
        .describe('配置构建缓存文件目录, 默认值 "node_modules/.cache"'),
    chainWebpack: ({ zod }) => zod.function(),
    copy: ({ zod }) =>
      zod
        .array(
          zod.union([
            zod.object({
              from: zod.string(),
              to: zod.string(),
            }),
            zod.string(),
          ]),
        )
        .describe('配置要复制到输出目录的文件或文件夹。'),
    cssLoader: ({ zod }) =>
      zod
        .record(zod.any())
        .describe(
          '配置 css-loader ，详见 {@link https://github.com/webpack-contrib/css-loader#options css-loader > options}.',
        ),
    cssLoaderModules: ({ zod }) =>
      zod
        .record(zod.any())
        .describe(
          '配置 css modules 的行为，详见 {@link https://github.com/webpack-contrib/css-loader#modules css-loader > modules }。',
        ),
    cssMinifier: ({ zod }) =>
      zod
        .enum([
          CSSMinifier.cssnano,
          CSSMinifier.esbuild,
          CSSMinifier.parcelCSS,
          CSSMinifier.none,
        ])
        .describe(
          '配置构建时使用的 CSS 压缩工具; 默认值：esbuild, none 表示不压缩, \n可选的值：esbuild, cssnano, parcelCSS, none',
        ),
    cssMinifierOptions: ({ zod }) =>
      zod.record(zod.any()).describe('cssMinifier CSS 压缩工具配置选项'),
    deadCode: ({ zod }) =>
      zod
        .object({
          context: zod
            .boolean()
            .describe(`匹配开始的目录，默认为当前项目根目录`),
          detectUnusedExport: zod
            .boolean()
            .describe(`是否检测未使用的导出，默认 true 检测`),
          detectUnusedFiles: zod
            .boolean()
            .describe(`是否检测未使用的文件，默认 true 检测`),
          exclude: zod
            .array(zod.string())
            .describe(`排除检测的范围，如 ['src/pages/utils/**']`),
          failOnHint: zod
            .boolean()
            .describe(`检测失败是否终止进程，默认 false 不终止`),
          patterns: zod
            .array(zod.string())
            .describe(`识别代码的范围，如 ['src/pages/**']`),
        })
        .deepPartial()
        .describe('检测未使用的文件和导出，仅在 build 阶段开启'),
    define: ({ zod }) =>
      zod
        .record(zod.string())
        .describe(
          '设置代码中的可用变量, 注意：属性值会经过一次 JSON.stringify 转换。',
        ),
    depTranspiler: ({ zod }) =>
      zod.enum([
        Transpiler.babel,
        Transpiler.esbuild,
        Transpiler.swc,
        Transpiler.none,
      ]),
    devtool: ({ zod }) =>
      zod
        .union([zod.enum(DevToolValues), zod.boolean()])
        .describe(
          '设置 sourcemap 生成方式, \n dev 时默认 cheap-module-source-map，build 时候默认无 sourcemap \n false 关闭 sourmap 生成',
        ),
    esm: ({ zod }) => zod.object({}),
    externals: ({ zod }) =>
      zod.union([
        zod.record(zod.string()),
        zod.record(zod.array(zod.string())),
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
    forkTSChecker: ({ zod }) =>
      zod
        .object({})
        .describe(
          '开启 TypeScript 的类型检查。基于 fork-ts-checker-webpack-plugin，配置项可参考 fork-ts-checker-webpack-plugin 的 Options。',
        ),
    hash: ({ zod }) =>
      zod
        .boolean()
        .describe(
          '开启 hash 模式，让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。',
        ),
    https: ({ zod }) =>
      zod
        .object({
          cert: zod.string(),
          hosts: zod
            .array(zod.string())
            .describe(
              `用于指定要支持 https 访问的 host，默认是 ['127.0.0.1', 'localhost']`,
            ),
          http2: zod
            .boolean()
            .describe(
              `用于指定是否使用 HTTP 2.0 协议，默认是 true（使用 HTTP 2.0 在 Chrome 或 Edge 浏览器中中有偶然出现 ERR_HTTP2_PROTOCOL_ERRO报错，如有遇到，建议配置为 false）`,
            ),
          key: zod.string(),
        })
        .deepPartial()
        .describe('开启 dev 的 https 模式'),
    ignoreMomentLocale: ({ zod }) =>
      zod.boolean().describe('忽略 moment 的 locale 文件，用于减少产物尺寸。'),
    inlineLimit: ({ zod }) =>
      zod
        .number()
        .describe(
          '配置图片文件是否走 base64 编译的阈值。默认是 10000 字节，少于他会被编译为 base64 编码，否则会生成单独的文件。\n默认值：10000 (10k)',
        ),
    jsMinifier: ({ zod }) =>
      zod
        .enum([
          JSMinifier.esbuild,
          JSMinifier.swc,
          JSMinifier.terser,
          JSMinifier.uglifyJs,
          JSMinifier.none,
        ])
        .describe('配置构建时压缩 JavaScript 的工具；none表示不压缩。'),
    jsMinifierOptions: ({ zod }) =>
      zod
        .record(zod.any())
        .describe(
          'jsMinifier 的配置项；默认情况下压缩代码会移除代码中的注释，可以通过对应的 jsMinifier 选项来保留注释。',
        ),
    lessLoader: ({ zod }) =>
      zod
        .record(zod.any())
        .describe(
          '设置 less-loader 的 Options。具体参考参考 {@link https://github.com/webpack-contrib/less-loader#lessoptions less-loader 的 Options }。',
        ),
    manifest: ({ zod }) =>
      zod
        .object({
          basePath: zod
            .string()
            .describe('basePath 会给所有文件路径加上前缀。'),
          fileName: zod
            .string()
            .describe('fileName 是生成的文件名，默认是 asset-manifest.json'),
        })
        .deepPartial()
        .describe('开启 build 时生成额外的 manifest 文件，用于描述产物。'),
    mdx: ({ zod }) =>
      zod
        .object({
          loader: zod.string(),
          loaderOptions: zod.record(zod.any()),
        })
        .deepPartial()
        .describe('mdx loader 配置 loader 配置路径，loaderOptions 配置参数'),
    mfsu: ({ zod }) =>
      zod.union([
        zod
          .object({
            cacheDirectory: zod
              .string()
              .describe(`可以自定义缓存目录，默认是 node_modules/.cache/mfsu`),
            chainWebpack: zod
              .function()
              .describe(
                `用链式编程的方式修改 依赖的 webpack 配置，基于 webpack-chain，具体 API 可参考 webpack-api 的文档；`,
              ),
            esbuild: zod
              .boolean()
              .describe(
                '配为 true 后会让依赖的预编译走 esbuild，从而让首次启动更快，缺点是二次编译不会有物理缓存，稍慢一些；推荐项目依赖比较稳定的项目使用',
              ),
            exclude: zod
              .array(zod.union([zod.string(), zod.instanceof(RegExp)]))
              .describe(
                `动排除某些不需要被 MFSU 处理的依赖, 字符串或者正则的形式，比如 vant 不希望走 MFSU 处理，可以配置 { exclude: [ 'vant' ] } 匹配逻辑为全词匹配，也可以配置 { exclude: [ /vant/ ] } 只要 import 路径中匹配该正则的依赖都不走 MFSU 处理`,
              ),
            include: zod
              .array(zod.string())
              .describe(
                `仅在 strategy: 'eager' 模式下生效， 用于补偿在 eager 模式下，静态分析无法分析到的依赖，例如 react 未进入 Module Federation 远端模块可以这样配置 { include: [ 'react' ] }`,
              ),
            mfName: zod
              .string()
              .describe(
                `是此方案的 remote 库的全局变量，默认是 mf，通常在微前端中为了让主应用和子应用不冲突才会进行配置`,
              ),
            remoteAliases: zod.array(zod.string()),
            remoteName: zod.string(),
            runtimePublicPath: zod
              .boolean()
              .describe(
                `会让修改 mf 加载文件的 publicPath 为 window.publicPath`,
              ),
            shared: zod.record(zod.any()),
            strategy: zod
              .enum(['eager', 'normal'])
              .default('normal')
              .describe(
                '指定 mfsu 编译依赖的时机; normal 模式下，采用 babel 编译分析后，构建 Module Federation 远端包；eager 模式下采用静态分析的方式，和项目代码同时发起构建。',
              ),
          })
          .deepPartial(),
        zod.boolean(),
      ]),
    normalCSSLoaderModules: ({ zod }) => zod.object({}),
    outputPath: ({ zod }) =>
      zod
        .string()
        .describe(
          '配置输出路径。默认值：dist \n注意：不允许设定为 src、public、pages、mock、config、locales、models 等约定式功能相关的目录',
        ),
    postcssLoader: ({ zod }) =>
      zod.record(zod.any()).describe('设置 postcss-loader 的配置项。'),
    // TODO 这里可以给具体的配置
    proxy: ({ zod }) =>
      zod
        .union([zod.record(zod.any()), zod.array(zod.any())])
        .describe('配置代理。'),
    publicPath: ({ zod }) =>
      zod.string().describe(`配置 webpack 的 publicPath。`),
    purgeCSS: ({ zod }) => zod.object({}),
    runtimePublicPath: ({ zod }) =>
      zod
        .object({})
        .describe(
          `启用运行时 publicPath，开启后会使用 window.publicPath 作为资源动态加载的起始路径。`,
        ),
    sassLoader: ({ zod }) =>
      zod.record(zod.any()).describe('配置 sass-loader 的配置项。'),
    srcTranspiler: ({ zod }) =>
      zod
        .enum([
          Transpiler.babel,
          Transpiler.esbuild,
          Transpiler.swc,
          Transpiler.none,
        ])
        .describe(
          '配置构建时转译 js/ts 的工具。\n可选的值：babel, swc, esbuild, none\n默认值：babel',
        ),
    srcTranspilerOptions: ({ zod }) =>
      zod
        .object({
          esbuild: zod.record(zod.any()),
          swc: zod.record(zod.any()),
        })
        .deepPartial()
        .describe(
          `如果你使用了 swc / esbuild 作为 srcTranspiler 转译器，你可以通过此选项对转译器做进一步的配置，详见 SwcConfig 、 EsbuildConfig 配置文档。`,
        ),
    styleLoader: ({ zod }) =>
      zod.record(zod.any()).describe('配置 style-loader 的配置项。'),
    svgo: ({ zod }) =>
      zod
        .union([zod.record(zod.any()), zod.boolean()])
        .describe(`配置 svgo 的配置项。`),
    svgr: ({ zod }) => zod.object({}).describe(`配置 svgr 的配置项。`),
    targets: ({ zod }) =>
      zod.record(zod.string(), zod.number()).describe(`配置浏览器兼容范围。`),
    theme: ({ zod }) =>
      zod.record(zod.string()).describe(`配置 less 变量主题。`),
    writeToDisk: ({ zod }) =>
      zod
        .boolean()
        .describe(
          `开启后会在 dev 模式下额外输出一份文件到 dist 目录，通常用于 chrome 插件、electron 应用、sketch 插件等开发场景。`,
        ),
  };
}
