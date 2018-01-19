import { resolvePlugins } from 'umi-plugin';
import resolvePlugin from './resolvePlugin';
import registerBabel from './registerBabel';

export default function(opts = {}) {
  const { configPlugins = [], pluginsFromOpts = [], babel, cwd } = opts;

  const plugins = [...(configPlugins || []), ...(pluginsFromOpts || [])].map(
    p => {
      try {
        return resolvePlugin(p, { cwd });
      } catch (e) {
        throw new Error(`Plugin ${p} don't exists.`);
      }
    },
  );
  if (plugins.length) {
    registerBabel(babel, {
      only: [new RegExp(`(${plugins.join('|')})`)],
    });
  }
  return resolvePlugins(plugins);
}
