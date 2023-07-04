import { winPath } from '@umijs/utils';
import { join } from 'path';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    if (api.userConfig.mpa || api.config.mpa) {
      throw new Error('transitionRouter plugin does not support mpa mode');
    }
    if (api.appData.framework !== 'react') {
      throw new Error('transitionRouter plugin only support react framework');
    }
    const isReact18 = (
      api.appData.react?.version as string | undefined
    )?.startsWith('18');
    if (!isReact18) {
      throw new Error('transitionRouter plugin only support react@18');
    }

    // https://github.com/remix-run/remix/issues/5763
    api.writeTmpFile({
      path: 'runtime.ts',
      content: `
import { startTransition } from 'react';

export const modifyClientRenderOpts = (context) => {
  const h = context.history
  const originPush = h.push
  const originReplace = h.replace
  h.push = (...args) => {
    startTransition(() => originPush.apply(h, args))
  }
  h.replace = (...args) => {
    startTransition(() => originReplace.apply(h, args))
  }
  return context
}
`,
    });
  });

  const pluginDir = `plugin-${api.plugin.key}`;
  api.addRuntimePlugin(() => [
    winPath(join(api.paths.absTmpPath, `${pluginDir}/runtime.ts`)),
  ]);
};
