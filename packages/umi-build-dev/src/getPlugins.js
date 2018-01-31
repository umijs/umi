import { resolvePlugins } from 'umi-plugin';
import excapeRegExp from 'lodash.escaperegexp';
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
      only: [
        new RegExp(
          `(${plugins
            .map(p => {
              return excapeRegExp(p);
            })
            .join('|')})`,
        ),
      ],
    });
  }
  return resolvePlugins(plugins);
}
