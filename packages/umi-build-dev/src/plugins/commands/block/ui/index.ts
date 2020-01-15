import { IApi } from 'umi-types';
import server from './server';

export interface IApiBlock extends IApi {
  sendLog: (info: string) => void;
}

export default (api: IApiBlock) => {
  // 客户端
  api.addUIPlugin(
    require.resolve('../../../../../src/plugins/commands/block/ui/dist/client.umd.js'),
  );
  // 服务端
  server(api);

  let routeComponents = null;

  api.onRouteChange(() => {
    routeComponents = api.getRouteComponents();
  });

  api.modifyAFWebpackOpts(memo => {
    routeComponents = api.getRouteComponents();
    memo.extraBabelPlugins = [
      ...(memo.extraBabelPlugins || []),
      [
        require.resolve('../sdk/flagBabelPlugin'),
        {
          doTransform(filename) {
            return routeComponents.includes(api.winPath(filename));
          },
        },
      ],
    ];
    return memo;
  });

  api.addEntryCode(`
(() => {
  // Runtime block add component
  window.GUmiUIFlag = require('${api.relativeToTmp(
    require.resolve('../sdk/flagBabelPlugin/GUmiUIFlag'),
  )}').default;

  // Enable/Disable block add edit mode
  window.addEventListener('message', (event) => {
    try {
      const { action, data } = JSON.parse(event.data);
      switch (action) {
        case 'umi.ui.checkValidEditSection':
          const haveValid = !!document.querySelectorAll('div.g_umiuiBlockAddEditMode').length;
          const frame = document.getElementById('umi-ui-bubble');
          if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage(
              JSON.stringify({
                action: 'umi.ui.checkValidEditSection.success',
                payload: {
                  haveValid,
                },
              }),
              '*',
            );
          }
        default:
          break;
      }
    } catch(e) {
    }
  }, false);
})();
  `);
};
