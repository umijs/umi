import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import type { IApi } from '../../types';

/**
 * plugin for built-in react-helmet-async
 */
export default (api: IApi) => {
  api.describe({
    config: {
      schema: ({ zod }) => zod.boolean(),
    },
  });

  api.onGenerateFiles(() => {
    if (api.appData.framework === 'react') {
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/helmet.ts',
        content: `import React from 'react';
import { HelmetProvider } from '${winPath(
          dirname(require.resolve('@umijs/renderer-react/package')),
        )}';
import { context } from './helmetContext';

export const innerProvider = (container) => {
  return React.createElement(HelmetProvider, { context }, container);
}`,
      });

      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/helmetContext.ts',
        content: `export const context = {};`,
      });
    }
  });

  api.addRuntimePlugin(() =>
    api.appData.framework === 'react' ? ['@@/core/helmet.ts'] : [],
  );
};
