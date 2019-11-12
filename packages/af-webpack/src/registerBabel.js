export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, babelPlugins } = opts;
  if (!process.env.IS_FROM_UMI_TEST) {
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
