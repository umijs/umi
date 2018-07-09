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

  const {
    config: { react = {} },
  } = api.service;

  // mobile
  if (react.hd) require('./plugins/mobile/hd').default(api, react.hd);
  if (react.fastClick)
    require('./plugins/mobile/fastclick').default(api, react.fastClick);

  // performance
  if (react.library) require('./plugins/library').default(api, react.library);
  if (react.dynamicImport)
    require('./plugins/dynamicImport').default(api, react.dynamicImport);
  if (react.dll) require('umi-plugin-dll').default(api, react.dll);
  if (react.hardSource) require('./plugins/hardSource').default(api);
  // TODO: serviceWorker

  // deploy
  // TODO: loading
  if (react.loadingComponent)
    require('./plugins/loadingComponent').default(api);

  // misc
  if (react.dva) require('umi-plugin-dva').default(api, react.dva, react);
  if (react.polyfills)
    require('./plugins/polyfills').default(api, react.polyfills);

  // antd + antd-mobile
  require('./plugins/antd').default(api);
}
