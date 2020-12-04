import type { NodePath, Visitor } from '@babel/traverse';
import type { ImportDeclaration } from '@babel/types';
import { extname } from 'path';

export interface IOpts {
  flag?: string;
}

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl'];

export default function () {
  return {
    visitor: {
      ImportDeclaration(
        path: NodePath<ImportDeclaration>,
        { opts }: { opts: IOpts },
      ) {
        const {
          specifiers,
          source,
          source: { value },
        } = path.node;
        if (specifiers.length && CSS_EXTNAMES.includes(extname(value))) {
          source.value = `${value}?${opts.flag || 'modules'}`;
        }
      },
    } as Visitor,
  };
}
