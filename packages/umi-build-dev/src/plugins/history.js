import assert from 'assert';

export default function(api) {
  const { IMPORT, HISTORY_MODIFIER } = api.placeholder;
  const { config } = api.service;

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

  if (config.history === 'hash') {
    api.register('modifyEntryFile', ({ memo }) => {
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
    });
  }
}
