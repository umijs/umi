export default function(api) {
  const { IMPORT, HISTORY_MODIFIER } = api.placeholder;
  const { config } = api.service;

  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'hashHistory',
        onChange() {
          api.service.restart(/* why */ 'Config hashHistory Changed');
        },
      };
    });
    return memo;
  });

  if (config.hashHistory) {
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
