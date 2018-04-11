export default function(api) {
  const { config } = api.service;
  const { IMPORT } = api.placeholder;

  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'disableFastClick',
        onChange() {
          api.service.restart(/* why */ 'Config disableFastClick Changed');
        },
      };
    });
    return memo;
  });

  if (!config.disableFastClick) {
    api.register('modifyEntryFile', ({ memo }) => {
      memo = memo.replace(
        IMPORT,
        `
import FastClick from 'umi-fastclick';
${IMPORT}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    FastClick.attach(document.body);
  },
  false,
);
    `.trim(),
      );
      return memo;
    });

    api.register('modifyAFWebpackOpts', ({ memo }) => {
      // 取一个带 umi 前缀的别名，是为了后面可以修改他
      memo.alias['umi-fastclick'] = require.resolve('fastclick');
      return memo;
    });
  }
}
