import { IApi } from '@umijs/types';
import { resolve, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { renderReactPath, runtimePath } from './constants';

export function importsToStr(
  imports: { source: string; specifier?: string }[],
) {
  return imports.map((imp) => {
    const { source, specifier } = imp;
    if (specifier) {
      return `import ${specifier} from '${winPath(source)}';`;
    } else {
      return `import '${winPath(source)}';`;
    }
  });
}

function isReact18(opts: { pkg: any; cwd: string }) {
  const { pkg } = opts;
  if (!pkg) return false;
  const useCustomReact =
    (pkg.dependencies?.['react-dom'] || pkg.devDependencies?.['react-dom']) &&
    (pkg.dependencies?.['react'] || pkg.devDependencies?.['react']);

  function getVersion(name: string) {
    try {
      const pkgJSONPath = resolve.sync(`${name}/package.json`, {
        basedir: opts.cwd,
      });
      return parseInt(
        JSON.parse(readFileSync(pkgJSONPath, 'utf-8')).version.split('.')[0],
        10,
      );
    } catch (e) {
      return 0;
    }
  }

  if (useCustomReact) {
    const reactDOMVersion = getVersion('react-dom');
    const reactVersion = getVersion('react');
    return reactVersion >= 18 && reactDOMVersion >= 18;
  }

  return false;
}

export default function (api: IApi) {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async (args) => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    const patchedRenderReactPath = join(
      renderReactPath,
      `/dist/index${
        isReact18({
          pkg: api.pkg,
          cwd: api.cwd,
        })
          ? '18'
          : ''
      }.js`,
    );
    const rendererPath = await api.applyPlugins({
      key: 'modifyRendererPath',
      type: api.ApplyPluginsType.modify,
      initialValue: patchedRenderReactPath,
    });
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {
        // @ts-ignore
        enableTitle: api.config.title !== false,
        defaultTitle: api.config.title || '',
        rendererPath: winPath(rendererPath),
        runtimePath,
        rootElement: api.config.mountElementId,
        enableSSR: !!api.config.ssr,
        enableHistory: !!api.config.history,
        dynamicImport: !!api.config.dynamicImport,
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
