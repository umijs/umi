import { winPath } from '@umijs/utils';
import { dirname, relative } from 'path';
import type { IApi } from '../types';

/**
 * import/export/await-import/require match regular expression
 *
 * WHY: REGEXP
 * ref: https://github.com/umijs/umi-next/pull/230
 *
 * TODO: more choices
 * 1. fork es-module-lexer, support jsx
 * 2. use sourcemap of esbuild
 */
export const IEAR_REG_EXP = new RegExp(
  [
    // match content before quote ($1)
    '(',
    [
      // import/export statements
      [
        '(?:',
        // match head
        '(?:^|\\r|\\n|;)\\s*',
        // match identifier
        '(?:import|export)\\s+',
        [
          '(?:',
          '(?:',
          // match body
          [
            // match default & member import
            [
              // match default import
              [
                '(?:',
                // match type import
                '(?:type\\s*)?',
                // match variable name
                '[a-zA-Z_$][\\w_$]*\\s*,?\\s+',
                // optional
                ')?',
              ].join(''),
              // match member import/export (optional)
              '(?:{[^}]+}\\s+)?',
            ].join(''),
            // match contents import/export
            '(?:type\\s*)?\\*\\s+(?:as\\s+[a-zA-Z][\\w_$]*\\s+)?',
          ].join('|'),
          ')',
          // match from
          'from\\s+',
          // match direct file import
          '|\\s*',
          ')',
        ].join(''),
        ')',
      ].join(''),
      // import/require call
      [
        // match head (must be single function name)
        '(?:^|[^a-zA-Z\\w_$\\.])',
        // match call
        '(?:import|require)\\(\\s*',
      ].join(''),
    ].join('|'),
    ')',
    '(?:',
    // match quotes ($2)
    `('|")`,
    // match absolute file path ($3)
    `(\\/.*[^\\\\])\\2`,
    ')',
  ].join(''),
  // match full-content
  'g',
);

/**
 * transform absolute import/export/await-import/require path
 * @note  use to vite can deps:
 *        transform to relative path for .umi dir imports
 *        prefix `@fs` for node_modules imports
 */
export default function transformIEAR(
  { content, path }: { content: string; path: string },
  api: IApi,
) {
  return content.replace(IEAR_REG_EXP, (_, prefix, quote, absPath) => {
    if (absPath.startsWith(api.paths.absTmpPath)) {
      // transform .umi absolute imports
      absPath = winPath(relative(dirname(path), absPath));
    } else if (absPath.includes('node_modules')) {
      // transform node_modules absolute imports
      absPath = `@fs${absPath}`;
    }

    return `${prefix}${quote}${absPath}${quote}`;
  });
}
