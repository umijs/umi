import resolve from 'resolve';
import assert from 'assert';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';

const debug = require('debug')('umi-build-dev:getPlugin');

export default function(opts = {}) {
  const { configPlugins = [], pluginsFromOpts = [], babel, cwd } = opts;

  function pluginToPath(plugins) {
    return plugins.map(p => {
      assert(
        Array.isArray(p) || typeof p === 'string',
        `Plugin config should be String or Array, but got ${p}`,
      );
      if (typeof p === 'string') {
        p = [p];
      }
      const [path, opts] = p;
      try {
        return [
          resolve.sync(path, {
            basedir: cwd,
          }),
          opts,
        ];
      } catch (e) {
        throw new Error(
          `
Plugin ${path} can't be resolved, please make sure you have installed it.

Try:

  npm install ${path} --save-dev        
        `.trim(),
        );
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
    addBabelRegisterFiles(pluginPaths.map(p => p[0]));
    registerBabel(babel, {
      cwd,
    });
  }

  // 内置插件
  const builtInPlugins = [
    './plugins/output-path',
    './plugins/global-js',
    './plugins/global-css',
    './plugins/antd',
    './plugins/fastclick',
    './plugins/hd',
    './plugins/mock',
    './plugins/hash-history',
    './plugins/404', // 404 must after mock
  ];
  const plugins = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      const apply = require(p); // eslint-disable-line
      let opts;
      if (Array.isArray(p)) {
        opts = p[1]; // eslint-disable-line
        p = [0];
      }
      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts,
      };
    }),
    ...pluginPaths.map(p => {
      const [path, opts] = p;
      const apply = require(path); // eslint-disable-line
      return {
        id: path.replace(cwd, 'user:'),
        apply: apply.default || apply,
        opts,
      };
    }),
  ];

  debug(`plugins: ${plugins.map(p => p.id)}`);

  return plugins;
}
