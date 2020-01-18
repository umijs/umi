import assert from 'assert';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import isPlainObject from 'lodash/isPlainObject';
import { winPath } from 'umi-utils';

function getHistoryConfig(val) {
  return Array.isArray(val) ? val : [val];
}

export function getHistoryConfigString(opts, absSrcPath, extra = []) {
  let ret = Object.keys(opts).map(key => {
    let valueStr = `${opts[key]}`;
    if (typeof opts[key] === 'string') valueStr = `'${opts[key]}'`;
    if (typeof opts[key] === 'object') valueStr = JSON.stringify(opts[key]);

    if (key === 'getUserConfirmation') {
      if (typeof opts[key] === 'string' && /^\.{1,2}\//.test(opts[key])) {
        valueStr = `require('${winPath(join(absSrcPath, opts.getUserConfirmation))}').default`;
      } else if (typeof opts[key] === 'function') {
        valueStr = `${opts[key].toString()}`;
      } else {
        valueStr = 'undefined';
      }
    }
    return `${key}: ${valueStr}`;
  });
  if (extra) ret = ret.concat(extra);
  return `{${ret.join(',\r\n')}}`;
}

export default function(api) {
  const { config, paths } = api.service;

  api._registerConfig(() => {
    return api => {
      return {
        name: 'history',
        validate(val) {
          const [historyType, opts] = getHistoryConfig(val);
          assert(
            ['browser', 'hash', 'memory'].includes(historyType),
            `history should be browser or hash, but got ${historyType}`,
          );
          if (opts) {
            assert(
              isPlainObject(opts),
              `history options should be plain object, but got ${typeof opts}`,
            );
          }
        },
        onChange() {
          // regenerate dll file
          const filesInfoFile = join(paths.absNodeModulesPath, 'umi-dlls', 'filesInfo.json');
          if (existsSync(filesInfoFile)) {
            unlinkSync(filesInfoFile);
          }

          api.service.restart(/* why */ 'Config history Changed');
        },
        default: 'browser',
        group: 'route',
        title: {
          'zh-CN': 'History 类型',
          'en-US': 'History Type',
        },
        type: 'list',
        choices: ['browser', 'hash', 'memory'],
        description: {
          'zh-CN': 'History 类型，可选 browser、hash 和 memory。',
          'en-US': 'The history type, including browser, hash and memory.',
        },
      };
    };
  });

  api.modifyEntryHistory((memo, { ssr }) => {
    const [historyType, opts = {}] = getHistoryConfig(config.history);
    // use browserHistory by default or ssr is on
    let extra = [];
    if (config.exportStatic && config.exportStatic.dynamicRoot) {
      extra = ['basename: window.routerBase'];
    }
    const browserOpts = getHistoryConfigString(
      { ...opts, basename: config.base || opts.basename || '/' },
      paths.absSrcPath,
      extra,
    );
    let history = `require('umi/lib/createHistory').default(${browserOpts})`;
    if (ssr) return history;
    if (historyType === 'hash') {
      const hashOpts = getHistoryConfigString(
        { ...opts, basename: config.base || opts.basename || '/' },
        paths.absSrcPath,
      );
      history = `require('history').createHashHistory(${hashOpts})`;
    } else if (historyType === 'memory') {
      const memoryOpts = getHistoryConfigString({ ...opts }, paths.absSrcPath, [
        'initialEntries: window.g_initialEntries',
      ]);
      history = `require('history').createMemoryHistory(${memoryOpts})`;
    }
    return history;
  });

  api.addHTMLHeadScript((memo, { route }) => {
    return config.history === 'memory'
      ? [
          {
            content: `window.g_initialEntries = ['${route.path}'];`,
          },
        ]
      : [];
  });
}
