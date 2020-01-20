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
      require.resolve('./plugins/features/define'),
      require.resolve('./plugins/features/devtool'),
      require.resolve('./plugins/features/disableDynamicImport'),
      require.resolve('./plugins/features/externals'),
      require.resolve('./plugins/features/extraBabelPlugins'),
      require.resolve('./plugins/features/extraBabelPresets'),
      require.resolve('./plugins/features/hash'),
      require.resolve('./plugins/features/ignoreMomentLocale'),
      require.resolve('./plugins/features/inlineLimit'),
      require.resolve('./plugins/features/plugins'),
      require.resolve('./plugins/features/presets'),
      require.resolve('./plugins/features/proxy'),
      require.resolve('./plugins/features/runtimePublicPath'),
      require.resolve('./plugins/features/singular'),
      require.resolve('./plugins/features/styleLoader'),
      require.resolve('./plugins/features/targets'),
      require.resolve('./plugins/features/terserOptions'),
      require.resolve('./plugins/features/theme'),

      // commands
      require.resolve('./plugins/commands/version/version'),
      require.resolve('./plugins/commands/dev/dev'),
      require.resolve('./plugins/commands/dev/devCompileDone/devCompileDone'),
      require.resolve('./plugins/commands/build/build'),
      require.resolve('./plugins/commands/build/applyHtmlWebpackPlugin'),
      require.resolve('./plugins/commands/generate/generate'),
    ],
  };
}
