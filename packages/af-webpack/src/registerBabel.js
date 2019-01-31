export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, disablePreventTest } = opts;
  const plugins = [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: process.cwd(),
        alias: {
          '@': '.',
        },
      },
    ],
  ];

  if (disablePreventTest || process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [babelPreset],
      only,
      ignore,
      babelrc: false,
      cache: false,
      plugins: plugins,
    });
  }
}
