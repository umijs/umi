// @ts-nocheck
import { createHistory } from '@@/core/history';
import qiankunRender, { contextOptsStack } from './lifecycles';

export function render(oldRender: any) {
  // 在 ssr 的场景下，直接返回旧的 render
  if (typeof window === 'undefined') {
    return oldRender();
  }
  return qiankunRender().then(oldRender);
}

export function modifyClientRenderOpts(memo: any) {
  // 每次应用 render 的时候会调 modifyClientRenderOpts，这时尝试从队列中取 render 的配置
  const clientRenderOpts = contextOptsStack.shift();
  const { basename, historyType } = memo;

  // use ?? instead of ||, incase clientRenderOpts.basename is ''
  // only break when microApp has a config.base and mount path is /*
  const newBasename = clientRenderOpts?.basename ?? basename;
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
