import resolve from 'resolve';
import assert from 'assert';
import chalk from 'chalk';
import { UmiError } from 'umi-core/lib/error';
import { winPath } from 'umi-utils';

import registerBabel, { addBabelRegisterFiles } from './registerBabel';
import isEqual from './isEqual';
import getCodeFrame from './utils/getCodeFrame';

const debug = require('debug')('umi-build-dev:getPlugin');

export default function(opts = {}) {
  const { cwd, plugins = [] } = opts;

  // 内置插件
  const builtInPlugins = [
    './plugins/commands/dev',
    './plugins/commands/build',
    './plugins/commands/inspect',
    './plugins/commands/test',
    './plugins/commands/help',
    './plugins/commands/generate',
    './plugins/commands/rm',
    './plugins/commands/config',
    ...(process.env.UMI_UI === 'none' ? [] : [require.resolve('umi-plugin-ui')]),
    './plugins/commands/block',
    './plugins/commands/version',
    './plugins/global-js',
    './plugins/global-css',
    './plugins/mountElementId',
    './plugins/mock',
    './plugins/proxy',
    './plugins/history',
    './plugins/afwebpack-config',
    './plugins/404', // 404 must after mock
    './plugins/targets',
    './plugins/importFromUmi',
  ];

  const pluginsObj = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      let opts;
      if (Array.isArray(p)) {
        /* eslint-disable prefer-destructuring */
        opts = p[1];
        p = p[0];
        /* eslint-enable prefer-destructuring */
      }
      const apply = require(p); // eslint-disable-line
      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts,
      };
    }),
    ...getUserPlugins(process.env.UMI_PLUGINS ? process.env.UMI_PLUGINS.split(',') : [], { cwd }),
    ...getUserPlugins(plugins, { cwd }),
  ];

  debug(`plugins: \n${pluginsObj.map(p => `  ${p.id}`).join('\n')}`);
  return pluginsObj;
}

function pluginToPath(plugins, { cwd }) {
  return (plugins || []).map(p => {
    assert(
      Array.isArray(p) || typeof p === 'string',
      `Plugin config should be String or Array, but got ${chalk.red(typeof p)}`,
    );
    if (typeof p === 'string') {
      p = [p];
    }
    const [path, opts] = p;
    try {
      return [
        winPath(
          resolve.sync(path, {
            basedir: cwd,
          }),
        ),
        opts,
      ];
    } catch (e) {
      throw new UmiError({
        code: 'ERR_CORE_PLUGIN_RESOLVE_FAILED',
        message: `Plugin ${chalk.underline.cyan(path)} can't be resolved`,
      });
    }
  });
}

function getUserPlugins(plugins, { cwd }) {
  const pluginPaths = pluginToPath(plugins, { cwd });

  // 用户给的插件需要做 babel 转换
  if (pluginPaths.length) {
    addBabelRegisterFiles(pluginPaths.map(p => p[0]), { cwd });
    registerBabel({
      cwd,
    });
  }

  return pluginPaths.map(p => {
    const [path, opts] = p;
    let apply;
    try {
      apply = require(path); // eslint-disable-line
    } catch (e) {
      throw new UmiError({
        code: 'ERR_CORE_PLUGIN_INITIALIZE_FAILED',
        message: `Plugin ${chalk.cyan.underline(path)} execute failed\n\n${chalk.white(
          getCodeFrame(e, { cwd }),
        )}`,
      });
    }
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
      optionChanged: newPlugins.filter((_, index) => {
        return !isEqual(newPlugins[index].opts, oldPlugins[index].opts);
      }),
    };
  }
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}
