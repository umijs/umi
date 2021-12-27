// @ts-nocheck
/* eslint-disable */
import qiankunRender from './lifecycles';

export function render(oldRender: any) {
  return qiankunRender().then(oldRender);
}

// export function modifyClientRenderOpts(memo: any) {
//   // 每次应用 render 的时候会调 modifyClientRenderOpts，这时尝试从队列中取 render 的配置
//   const clientRenderOpts = clientRenderOptsStack.shift();
//   if (clientRenderOpts) {
//     const history = clientRenderOpts.getHistory();
//     delete clientRenderOpts.getHistory;
//     clientRenderOpts.history = history;
//   }
//   return {
//     ...memo,
//     ...clientRenderOpts,
//   };
// }
