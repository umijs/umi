import assert from 'assert';

export default function(api) {
  const { IMPORT, HISTORY_MODIFIER } = api.placeholder;

  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
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
    });
    return memo;
  });

  api.register('modifyEntryFile', ({ memo }) => {
    const { config } = api.service;
    if (config.history === 'hash') {
      return memo
        .replace(
          IMPORT,
          `
import createHashHistory from 'history/createHashHistory';
${IMPORT}
        `.trim(),
        )
        .replace(
          HISTORY_MODIFIER,
          `
window.g_history = createHashHistory();
${HISTORY_MODIFIER}
        `.trim(),
        );
    } else {
      return memo;
    }
  });
}
