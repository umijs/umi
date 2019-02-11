export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, babelPlugins, disablePreventTest } = opts;
  if (disablePreventTest || process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [babelPreset],
      plugins: babelPlugins || [],
      only,
      ignore,
      babelrc: false,
      cache: false,
    });
  }
}
