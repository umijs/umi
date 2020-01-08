import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';

export default function(api: IApi) {
  const {
    paths,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async args => {
    const pluginTpl = readFileSync(join(__dirname, 'plugin.tpl'), 'utf-8');
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      type: api.ApplyPluginsType.add,
      initialValue: ['patchRoutes', 'rootContainer', 'render'],
    });
    api.writeTmpFile({
      path: 'core/plugin.ts',
      content: Mustache.render(pluginTpl, {
        validKeys,
        runtimePath: winPath(require.resolve('@umijs/runtime')),
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['plugin'],
      source: `${paths.aliasedTmpPath}/core/plugin`,
    };
  });
}
