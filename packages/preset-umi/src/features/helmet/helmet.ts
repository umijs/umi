import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import type { IApi } from '../../types';

/**
 * plugin for built-in react-helmet-async
 */
export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.boolean(),
    },
  });

  api.onGenerateFiles(() => {
    if (!api.config.vite) {
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/helmet.ts',
        content: `import React from 'react';
import { HelmetProvider } from '${winPath(
          dirname(require.resolve('@umijs/renderer-react/package')),
        )}';

export const innerProvider = (container) => {
  return React.createElement(HelmetProvider, { context: {} }, container);
}`,
      });
    }
  });

  api.addRuntimePlugin(() => (api.config.vite ? [] : ['@@/core/helmet.ts']));
};
