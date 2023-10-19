import { winPath } from '@umijs/utils';
import fs from 'fs';
import path from 'path';
import type { AtRule } from 'postcss';

export async function transform(cssContent: string, filePath: string) {
  const importPlugin = {
    postcssPlugin: 'importPlugin',
    AtRule: {
      import(atRule: AtRule) {
        let origin = atRule.params;
        // remove url() wrapper
        origin = origin.replace(/^url\((.+)\)$/g, '$1');
        // remove start ' or " and end ' or "
        origin = origin.replace(/^'(.+)'$/g, '$1').replace(/^"(.+)"$/g, '$1');

        // ~ 开头的肯定是从 node_modules 下查找
        if (origin.startsWith('~')) return;
        if (origin.startsWith('/')) return;

        function getResolvedPath(origin: string) {
          return winPath(path.resolve(path.dirname(filePath), origin));
        }

        // 已经包含 ./ 和 ../ 的场景，不需要额外处理
        // CSS 会优先找相对路径，如果找不到，会再找 node_modules 下的
        const resolvedPath = getResolvedPath(origin);
        if (fs.existsSync(resolvedPath)) {
          atRule.params = `"${resolvedPath}"`;
        } else {
          // Warn user if file not exists, but it should be existed
          if (origin.startsWith('./') || origin.startsWith('../')) {
            console.warn(`File does not exist: ${resolvedPath}`);
          }
        }
      },
    },
  };
  const selectorPlugin = require('postcss-prefix-selector')({
    // why not #root?
    // antd will insert dom into body, prefix #root will not work for that
    prefix: 'body',
    transform(_p: string, selector: string, prefixedSelector: string) {
      if (selector === 'html') {
        // special :first-child to promote html selector priority
        return `html:first-child`;
      } else if (/^body([\s+~>[:]|$)/.test(selector)) {
        // use html parent to promote body selector priority
        return `html ${selector}`;
      }
      return prefixedSelector;
    },
  });
  const result = await require('postcss')([
    selectorPlugin,
    importPlugin,
  ]).process(cssContent, {
    from: 'overrides.css',
  });
  return result.css;
}
