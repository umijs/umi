export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, babelPlugins, disablePreventTest } = opts;
  if (disablePreventTest || process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [require.resolve('@babel/preset-typescript'), babelPreset],
      plugins: babelPlugins || [],
      only,
      ignore,
      extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
      babelrc: false,
      cache: false,
    });
  }
}
