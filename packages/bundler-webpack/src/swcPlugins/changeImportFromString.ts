import type { ImportDeclaration, StringLiteral } from '@swc/core';

interface IStringLiteralExtend extends StringLiteral {
  raw: string;
}

export const changeImportFromString = (e: ImportDeclaration, v: string) => {
  e.source.value = v;
  // sync change to `raw`
  // https://github.com/swc-project/swc/issues/4128
  (e.source as IStringLiteralExtend).raw = `'${v}'`;
};
