import type { IApi } from '../../types';

/**
 * plugin for replace React Suspense with custom suspense
 * to avoid hydration error when page re-render in runtime
 * only for dumi static site now
 */
export default (api: IApi) => {
  api.describe({
    enableBy() {
      // FIXME: enable condition before merge
      // return Boolean(api.appData._useLoadingOnlySuspense);
      return true;
    },
  });

  api.writeTmpFile({
    noPluginDir: true,
    path: 'core/suspense.ts',
    content: `
import React, { Suspense } from 'react';

const LoadingOnlySuspense: typeof Suspense = (props) => {
  // TODO: implement
  return props.children;
}

export function modifyClientRenderOpts(memo: any) {
  memo.suspenseComponent = LoadingOnlySuspense;

  return memo;
}
    `,
  });

  api.addRuntimePlugin(() => ['@@/core/suspense.ts']);
};
