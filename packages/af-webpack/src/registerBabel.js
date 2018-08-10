export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, disablePreventTest } = opts;
  if (disablePreventTest || process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [babelPreset],
      plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
      only,
      ignore,
      babelrc: false,
      cache: false,
    });
  }
}
