export default function() {
  return {
    plugins: [
      // register methods
      require.resolve('./plugins/registerMethods'),

      // misc
      require.resolve('./plugins/routes'),

      // generate files
      require.resolve('./plugins/generateFiles/core/history'),
      require.resolve('./plugins/generateFiles/core/plugin'),
      require.resolve('./plugins/generateFiles/core/routes'),
      require.resolve('./plugins/generateFiles/core/umiExports'),
      require.resolve('./plugins/generateFiles/umi'),

      // bundle configs
      require.resolve('./plugins/features/alias'),
      require.resolve('./plugins/features/analyze'),
      require.resolve('./plugins/features/autoprefixer'),
      require.resolve('./plugins/features/base'),
      require.resolve('./plugins/features/chainWebpack'),
      require.resolve('./plugins/features/chunks'),
      require.resolve('./plugins/features/cssLoader'),
      require.resolve('./plugins/features/cssnano'),
      require.resolve('./plugins/features/copy'),
      require.resolve('./plugins/features/define'),
      require.resolve('./plugins/features/devServer'),
      require.resolve('./plugins/features/devtool'),
      require.resolve('./plugins/features/dynamicImport'),
      require.resolve('./plugins/features/exportStatic'),
      require.resolve('./plugins/features/externals'),
      require.resolve('./plugins/features/extraBabelPlugins'),
      require.resolve('./plugins/features/extraBabelPresets'),
      require.resolve('./plugins/features/extraPostCSSPlugins'),
      require.resolve('./plugins/features/globalCSS'),
      require.resolve('./plugins/features/globalJS'),
      require.resolve('./plugins/features/hash'),
      require.resolve('./plugins/features/ignoreMomentLocale'),
      require.resolve('./plugins/features/inlineLimit'),
      require.resolve('./plugins/features/lessLoader'),
      require.resolve('./plugins/features/manifest'),
      require.resolve('./plugins/features/mountElementId'),
      require.resolve('./plugins/features/outputPath'),
      require.resolve('./plugins/features/plugins'),
      require.resolve('./plugins/features/presets'),
      require.resolve('./plugins/features/proxy'),
      require.resolve('./plugins/features/publicPath'),
      require.resolve('./plugins/features/runtimePublicPath'),
      require.resolve('./plugins/features/singular'),
      require.resolve('./plugins/features/styleLoader'),
      require.resolve('./plugins/features/targets'),
      require.resolve('./plugins/features/terserOptions'),
      require.resolve('./plugins/features/theme'),
      require.resolve('./plugins/features/umiInfo'),
      require.resolve('./plugins/features/forkTSChecker'),

      // html
      require.resolve('./plugins/features/html/favicon'),
      require.resolve('./plugins/features/html/headScripts'),
      require.resolve('./plugins/features/html/links'),
      require.resolve('./plugins/features/html/metas'),
      require.resolve('./plugins/features/html/scripts'),
      require.resolve('./plugins/features/html/styles'),
      require.resolve('./plugins/features/html/title'),

      // commands
      require.resolve('./plugins/commands/build/build'),
      require.resolve('./plugins/commands/build/applyHtmlWebpackPlugin'),
      require.resolve('./plugins/commands/dev/dev'),
      require.resolve('./plugins/commands/dev/devCompileDone/devCompileDone'),
      require.resolve('./plugins/commands/dev/mock/mock'),
      require.resolve('./plugins/commands/generate/generate'),
      require.resolve('./plugins/commands/help/help'),
      require.resolve('./plugins/commands/plugin/plugin'),
      require.resolve('./plugins/commands/version/version'),
      require.resolve('./plugins/commands/webpack/webpack'),
    ],
  };
}
