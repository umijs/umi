import assert from 'assert';

export default function(api) {
  const { config } = api.service;

  api._registerConfig(() => {
    return api => {
      return {
        name: 'history',
        validate(val) {
          assert(
            ['browser', 'hash', 'memory'].includes(val),
            `history should be browser or hash, but got ${val}`,
          );
        },
        onChange() {
          api.service.restart(/* why */ 'Config history Changed');
        },
      };
    };
  });

  api.modifyEntryHistory(memo => {
    if (config.history === 'hash') {
      return `require('history/createHashHistory').default()`;
    } else if (config.history === 'memory') {
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
