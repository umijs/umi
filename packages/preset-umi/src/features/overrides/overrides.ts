import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { expandCSSPaths, watch } from '../../commands/dev/watch';
import type { IApi } from '../../types';
import { compileLess } from './compileLess';
import { transform } from './transform';

export function getOverridesCSS(absSrcPath: string) {
  return expandCSSPaths(join(absSrcPath, 'overrides')).find(existsSync);
}

export default (api: IApi) => {
  let watcher: ReturnType<typeof watch> | undefined;
  let watchedImports = new Set<string>();
  let generation = 0;

  function watchImports(files: string[]) {
    if (api.name !== 'dev') return;
    const next = new Set(files);
    if (!watcher && next.size) {
      watcher = watch({
        path: [],
        addToUnWatches: true,
        onChange: () => generate().catch((error) => api.logger.error(error)),
      });
    }
    if (watcher) {
      watcher.unwatch([...watchedImports].filter((file) => !next.has(file)));
      watcher.add([...next].filter((file) => !watchedImports.has(file)));
    }
    watchedImports = next;
  }

  async function generate() {
    const current = ++generation;
    const filePath = api.appData.overridesCSS[0];
    if (!filePath) {
      watchImports([]);
      return;
    }

    const subPath = 'core/overrides.css';
    let content = readFileSync(filePath, 'utf-8');
    let imports: string[] = [];
    if (filePath.endsWith('.less')) {
      const result = await compileLess({
        lessContent: content,
        filePath,
        modifyVars: {
          ...api.config.theme,
          ...api.config.lessLoader?.modifyVars,
        },
        alias: api.config.alias,
        targetPath: join(api.paths.absTmpPath!, subPath),
      });
      content = result.css;
      imports = result.imports;
    }
    content = await transform(content, filePath);
    if (current !== generation) return;
    watchImports(imports);
    api.writeTmpFile({
      path: subPath,
      content: content || '/* empty */',
      noPluginDir: true,
    });
  }
  api.onGenerateFiles(generate);

  api.addEntryImports(() => {
    return [
      api.appData.overridesCSS.length && {
        source: '@@/core/overrides.css',
      },
    ].filter(Boolean);
  });
};
