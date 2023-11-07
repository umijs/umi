import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { expandCSSPaths } from '../../commands/dev/watch';
import type { IApi } from '../../types';
import { compileLess } from './compileLess';
import { transform } from './transform';

export function getOverridesCSS(absSrcPath: string) {
  return expandCSSPaths(join(absSrcPath, 'overrides')).find(existsSync);
}

export default (api: IApi) => {
  let cachedContent: string | null = null;
  api.onGenerateFiles(async () => {
    if (api.appData.overridesCSS.length) {
      const filePath = api.appData.overridesCSS[0];
      let content = readFileSync(filePath, 'utf-8');
      if (content === cachedContent) return;
      const isLess = filePath.endsWith('.less');
      if (isLess) {
        content = await compileLess(
          content,
          filePath,
          {
            ...api.config.theme,
            ...api.config.lessLoader?.modifyVars,
          },
          api.config.alias,
        );
      }
      content = await transform(content, filePath);
      api.writeTmpFile({
        path: 'core/overrides.css',
        content: content || '/* empty */',
        noPluginDir: true,
      });
      cachedContent = content;
    }
  });

  api.addEntryImports(() => {
    return [
      api.appData.overridesCSS.length && {
        source: '@@/core/overrides.css',
      },
    ].filter(Boolean);
  });
};
