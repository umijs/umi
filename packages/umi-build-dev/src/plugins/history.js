import assert from 'assert';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

function getHistoryConfig(val) {
  return Array.isArray(val) ? val : [val];
}

export default function(api) {
  const { config, paths } = api.service;

  api._registerConfig(() => {
    return api => {
      return {
        name: 'history',
        validate(val) {
          const [historyType] = getHistoryConfig(val);
          assert(
            ['browser', 'hash', 'memory'].includes(historyType),
            `history should be browser or hash, but got ${historyType}`,
          );
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

  api.modifyEntryHistory(memo => {
    const [historyType, opts] = getHistoryConfig(config.history);

    if (historyType === 'hash') {
      const hashOpts = JSON.stringify({ basename: config.base || '/', ...opts } || {});
      return `require('history/createHashHistory').default(${hashOpts})`;
    } else if (historyType === 'memory') {
      return `require('history/createMemoryHistory').default({ initialEntries: window.g_initialEntries })`;
    }
    return memo;
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
