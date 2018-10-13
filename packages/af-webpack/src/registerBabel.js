export default function registerBabel(opts = {}) {
  const { only, ignore, babelPreset, disablePreventTest } = opts;
  if (disablePreventTest || process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [babelPreset],
      only,
      ignore,
      babelrc: false,
      cache: false,
    });
  }
}
