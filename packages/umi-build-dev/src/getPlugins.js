import excapeRegExp from 'lodash.escaperegexp';
import resolve from 'resolve';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';

const debug = require('debug')('umi-build-dev:getPlugin');

export default function(opts = {}) {
  const { configPlugins = [], pluginsFromOpts = [], babel, cwd } = opts;

  function pluginToPath(plugins) {
    return plugins.map(p => {
      try {
        return resolve.sync(p, {
          basedir: cwd,
        });
      } catch (e) {
        throw new Error(`Plugin ${p} don't exists.`);
      }
    });
  }

  // 拿到绝对路径
  const pluginPaths = [
    ...pluginToPath(configPlugins),
    ...pluginToPath(pluginsFromOpts),
  ];

  // 用户给的插件需要做 babel 转换
  if (pluginPaths.length) {
    addBabelRegisterFiles(pluginPaths);
    registerBabel(babel, {
      cwd,
    });
  }

  // 内置插件
  const builtInPlugins = [
    './plugins/global-css',
    './plugins/layout',
    './plugins/fastclick',
    './plugins/hd',
    './plugins/mock',
  ];
  const plugins = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      const apply = require(p); // eslint-disable-line
      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
      };
    }),
    ...pluginPaths.map(p => {
      const apply = require(p); // eslint-disable-line
      return {
        id: p.replace(cwd, 'user:'),
        apply: apply.default || apply,
      };
    }),
  ];

  debug(`plugins: ${plugins.map(p => p.id)}`);

  return plugins;
}
