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
      memo.extraPostCSSPlugins.push([
        // prefix #root for overrides.{ext} style file, to make sure selector priority is higher than async chunk style
        require('postcss-prefix-selector')({
          // put a fake prefix because api.config.mountElementId is not available in config stage
          prefix: '#fake',
          transform(
            _p: string,
            selector: string,
            _ps: string,
            filePath: string,
          ) {
            const isOverridesFile =
              winPath(api.appData.overridesCSS[0]) === winPath(filePath);

            if (
              isOverridesFile &&
              !new RegExp(`^#${api.config.mountElementId}([:[\\s]|$)`).test(
                selector,
              )
            ) {
              // special case for html and body, because they are not in #root
              if (selector === 'html') {
                return `html:first-child`;
              } else if (selector === 'body') {
                return `* + body`;
              }

              return `#${api.config.mountElementId} ${selector}`;
            }

            return selector;
          },
        }),
      ]);
    }

    return memo;
  });
};
