import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { IApi } from '@umijs/types';
import { getFile, winPath } from '@umijs/utils';

export default function (api: IApi) {
  const {
    paths,
    utils: { Mustache },
  } = api;
  
  const customizedRuntimePath = getFile({
    base: api.paths.absSrcPath,
    fileNameWithoutExt: 'app',
    type: 'javascript',
  })?.path;

  if (customizedRuntimePath) {
    api.addRuntimePlugin({
      fn: () => customizedRuntimePath,
      stage: -1 * Number.MAX_SAFE_INTEGER,
    });
  }

  api.onGenerateFiles(async (args) => {
    const pluginTpl = readFileSync(join(__dirname, 'plugin.tpl'), 'utf-8');
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      type: api.ApplyPluginsType.add,
      initialValue: ['patchRoutes', 'rootContainer', 'render', 'onRouteChange'],
    });
    const plugins = await api.applyPlugins({
      key: 'addRuntimePlugin',
      type: api.ApplyPluginsType.add,
      initialValue: [],
    });
    api.writeTmpFile({
      path: 'core/plugin.ts',
      content: Mustache.render(pluginTpl, {
        validKeys,
        runtimePath: winPath(
          dirname(require.resolve('@umijs/runtime/package.json')),
        ),
        plugins: plugins.map(winPath),
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['plugin'],
      source: `./plugin`,
    };
  });
}
