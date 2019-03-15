import assert from 'assert';

function getHistoryConfig(val) {
  return Array.isArray(val) ? val : [val];
}

export default function(api) {
  const { config } = api.service;

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
          api.service.restart(/* why */ 'Config history Changed');
        },
      };
    };
  });

  api.modifyEntryHistory(memo => {
    const [historyType, opts] = getHistoryConfig(config.history);

    if (historyType === 'hash') {
      const hashOpts = JSON.stringify(opts || {});
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
