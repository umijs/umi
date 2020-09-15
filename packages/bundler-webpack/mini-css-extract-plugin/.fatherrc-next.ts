export default {
  formats: [
    [
      'cjs',
      {
        bundle: true,
        entryPoints: {
          'src/index.js': {},
          'src/loader.js': {},
          'src/hmr/hotModuleReplacement.js': {
            platform: 'browser',
            targetFilePath: 'hmr/hotModuleReplacement.js',
          },
        },
      },
    ],
  ],
};
