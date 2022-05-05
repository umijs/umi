// @ts-nocheck
import qiankunRender, { contextOptsStack } from './lifecycles';

export function render(oldRender: any) {
  return qiankunRender().then(oldRender);
}

export function modifyContextOpts(memo: any) {
  // 每次应用 render 的时候会调 modifyClientRenderOpts，这时尝试从队列中取 render 的配置
  const clientRenderOpts = contextOptsStack.shift();
  return {
    ...memo,
    ...clientRenderOpts,
  };
}
