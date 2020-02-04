import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';

export function importsToStr(
  imports: { source: string; specifier?: string }[],
) {
  return imports.map(imp => {
    const { source, specifier } = imp;
    if (specifier) {
      return `import ${specifier} from '${winPath(source)}';`;
    } else {
      return `import '${winPath(source)}';`;
    }
  });
}

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
        rootElement: api.config.mountElementId,
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
        polyfillImports: importsToStr(
          await api.applyPlugins({
            key: 'addPolyfillImports',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
        importsAhead: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImportsAhead',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
        imports: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImports',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
      }),
    });
  });
}
