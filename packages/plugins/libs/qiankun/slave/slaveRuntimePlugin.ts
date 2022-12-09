// @ts-nocheck
import qiankunRender, { contextOptsStack } from './lifecycles';
import { createHistory } from '@@/core/history';

export function render(oldRender: any) {
  return qiankunRender().then(oldRender);
}

export function modifyClientRenderOpts(memo: any) {
  // 每次应用 render 的时候会调 modifyClientRenderOpts，这时尝试从队列中取 render 的配置
  const clientRenderOpts = contextOptsStack.shift();
  const { basename, historyType } = memo;

  const newBasename = clientRenderOpts?.basename || basename;
  const newHistoryType = clientRenderOpts?.historyType || historyType;

  if (newHistoryType !== historyType || newBasename !== basename) {
    clientRenderOpts.history = createHistory({
      type: newHistoryType,
      basename: newBasename,
      ...clientRenderOpts.historyOpts,
    });
  }
  return {
    ...memo,
    ...clientRenderOpts,
    basename: newBasename,
    historyType: newHistoryType,
  };
}
