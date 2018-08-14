import assert from 'assert';

export default function(api) {
  const { config } = api.service;

  api._registerConfig(() => {
    return api => {
      return {
        name: 'history',
        validate(val) {
          assert(
            ['browser', 'hash'].includes(val),
            `history should be browser or hash, but got ${val}`,
          );
        },
        onChange() {
          api.service.restart(/* why */ 'Config history Changed');
        },
      };
    };
  });

  api.addEntryImportAhead(() => {
    if (config.history === 'hash') {
      return {
        source: 'history/createHashHistory',
        specifier: 'createHashHistory',
      };
    }
    return [];
  });

  api.modifyEntryHistory(memo => {
    if (config.history === 'hash') {
      return `createHashHistory()`;
    }
    return memo;
  });
}
