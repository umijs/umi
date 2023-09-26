import { winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { expandCSSPaths } from '../../commands/dev/watch';
import type { IApi } from '../../types';

export function getOverridesCSS(absSrcPath: string) {
  return expandCSSPaths(join(absSrcPath, 'overrides')).find(existsSync);
}

export default (api: IApi) => {
  api.modifyConfig((memo) => {
    if (getOverridesCSS(api.paths.absSrcPath)) {
      memo.extraPostCSSPlugins ??= [];
      memo.extraPostCSSPlugins.push(
        // prefix #root for overrides.{ext} style file, to make sure selector priority is higher than async chunk style
        require('postcss-prefix-selector')({
          // why not #root?
          // antd will insert dom into body, prefix #root will not works for that
          prefix: 'body',
          transform(
            _p: string,
            selector: string,
            prefixedSelector: string,
            filePath: string,
          ) {
            const isOverridesFile =
              winPath(api.appData.overridesCSS[0]) === winPath(filePath);

            if (isOverridesFile) {
              if (selector === 'html') {
                // special :first-child to promote html selector priority
                return `html:first-child`;
              } else if (/^body([\s+~>[:]|$)/.test(selector)) {
                // use html parent to promote body selector priority
                return `html ${selector}`;
              }

              return prefixedSelector;
            }

            return selector;
          },
        }),
      );
    }

    return memo;
  });
};
