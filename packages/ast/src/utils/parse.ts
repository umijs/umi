import { t, parser } from '@umijs/utils';

export function parse(code: string): t.File {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}
