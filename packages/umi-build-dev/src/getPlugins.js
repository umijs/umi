import resolve from 'resolve';
import assert from 'assert';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';
import isEqual from './isEqual';

const debug = require('debug')('umi-build-dev:getPlugin');

export default function(opts = {}) {
  const { cwd, plugins = [] } = opts;

  // 内置插件
  const builtInPlugins = [
    './plugins/commands/dev',
    './plugins/commands/build',
    './plugins/commands/test',
    './plugins/commands/help',
    './plugins/commands/generate',
    './plugins/commands/version',
    './plugins/global-js',
    './plugins/global-css',
    './plugins/base',
    './plugins/mountElementId',
    './plugins/mock',
    './plugins/proxy',
    './plugins/history',
    './plugins/afwebpack-config',
    './plugins/mountElementId',
    './plugins/404', // 404 must after mock
    // Disable this since it make umi build exit very slowly (4s+)
    // './plugins/atoolMonitor',
  ];

  const pluginsObj = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      const apply = require(p); // eslint-disable-line
      let opts;
      if (Array.isArray(p)) {
        opts = p[1]; // eslint-disable-line
        p = p[0];
      }
      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts,
      };
    }),
    ...getUserPlugins(
      process.env.UMI_PLUGINS ? process.env.UMI_PLUGINS.split(',') : [],
      { cwd },
    ),
    ...getUserPlugins(plugins, { cwd }),
  ];

  debug(`plugins: \n${pluginsObj.map(p => `  ${p.id}`).join('\n')}`);
  return pluginsObj;
}

function pluginToPath(plugins, { cwd }) {
  return (plugins || []).map(p => {
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
      throw new Error(`Plugin ${path} can't be resolved`);
    }
  });
}

function getUserPlugins(plugins, { cwd }) {
  const pluginPaths = pluginToPath(plugins, { cwd });

  // 用户给的插件需要做 babel 转换
  if (pluginPaths.length) {
    addBabelRegisterFiles(pluginPaths.map(p => p[0]));
    registerBabel({
      cwd,
    });
  }

  return pluginPaths.map(p => {
    const [path, opts] = p;
    const apply = require(path); // eslint-disable-line
    return {
      id: path.replace(makesureLastSlash(cwd), 'user:'),
      apply: apply.default || apply,
      opts,
    };
  });
}

function resolveIdAndOpts({ id, opts }) {
  return { id, opts };
}

function toIdStr(plugins) {
  return plugins.map(p => p.id).join('^^');
}

/**
 * 返回结果：
 *   pluginsChanged: true | false
 *   optionChanged: [ 'a', 'b' ]
 */
export function diffPlugins(newOption, oldOption, { cwd }) {
  const newPlugins = getUserPlugins(newOption, { cwd }).map(resolveIdAndOpts);
  const oldPlugins = getUserPlugins(oldOption, { cwd }).map(resolveIdAndOpts);

  if (newPlugins.length !== oldPlugins.length) {
    return { pluginsChanged: true };
  } else if (toIdStr(newPlugins) !== toIdStr(oldPlugins)) {
    return { pluginsChanged: true };
  } else {
    return {
      optionChanged: newPlugins.filter((p, index) => {
        return !isEqual(newPlugins[index].opts, oldPlugins[index].opts);
      }),
    };
  }
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}
