import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';

export default function(api: IApi) {
  const {
    env,
    paths,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async args => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {
        rendererPath: winPath(require.resolve('@umijs/renderer-react')),
        runtimePath: winPath(require.resolve('@umijs/runtime')),
        aliasedTmpPath: paths.aliasedTmpPath,
        entryCode: (
          await api.applyPlugins({
            key: 'addEntryCode',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          })
        ).join('\r\n'),
        entryCodeAhead: (
          await api.applyPlugins({
            key: 'addEntryCodeAhead',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          })
        ).join('\r\n'),
      }),
    });
  });
}
