import resolve from 'resolve';

export default function(plugin, opts = {}) {
  const { cwd } = opts;
  return resolve.sync(plugin, {
    basedir: cwd,
  });
}
