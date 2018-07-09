export default function(api) {
  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'react',
        onChange() {
          api.service.restart(/* why */ 'Config react changed');
        },
      };
    });
    return memo;
  });

  // mobile
  require('./plugins/mobile/hd').default(api);
  require('./plugins/mobile/fastclick').default(api);

  // performance
  require('./plugins/library').default(api);
  require('./plugins/dynamicImport').default(api);
  // TODO: serviceWorker

  // antd + antd-mobile
  require('./plugins/antd').default(api);
}
