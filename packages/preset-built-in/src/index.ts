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
      require.resolve('./plugins/bundle/alias'),
      require.resolve('./plugins/bundle/define'),
      require.resolve('./plugins/bundle/hash'),
      require.resolve('./plugins/bundle/ignoreMomentLocale'),
      require.resolve('./plugins/bundle/targets'),

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
