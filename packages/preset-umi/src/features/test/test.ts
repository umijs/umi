import { winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { importsToStr } from '../tmpFiles/importsToStr';

export default (api: IApi) => {
  api.describe({
    key: 'test',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy() {
      return api.appData.framework === 'react';
    },
  });

  api.onGenerateFiles(async () => {
    const rendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyRendererPath',
        initialValue: dirname(
          require.resolve('@umijs/renderer-react/package.json'),
        ),
      }),
    );
    // testBrowser.tsx
    api.writeTmpFile({
      noPluginDir: true,
      path: 'testBrowser.tsx',
      tplPath: join(TEMPLATES_DIR, 'TestBrowser.tpl'),
      context: {
        mountElementId: api.config.mountElementId,
        rendererPath,
        publicPath: api.config.publicPath,
        runtimePublicPath: api.config.runtimePublicPath ? 'true' : 'false',
        polyfillImports: importsToStr(
          await api.applyPlugins({
            key: 'addPolyfillImports',
            initialValue: [],
          }),
        ).join('\n'),
        importsAhead: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImportsAhead',
            initialValue: [
              api.appData.globalCSS.length && {
                source: api.appData.globalCSS[0],
              },
              api.appData.globalJS.length && {
                source: api.appData.globalJS[0],
              },
            ].filter(Boolean),
          }),
        ).join('\n'),
        imports: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImports',
            initialValue: [],
          }),
        ).join('\n'),
        basename: api.config.base,
        historyType: api.config.history.type,
        reactRouter5Compat: !!api.config.reactRouter5Compat,
        hydrate: !!api.config.ssr,
        loadingComponent:
          existsSync(join(api.paths.absSrcPath, 'loading.tsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.jsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.js')),
      },
    });
  });
};
