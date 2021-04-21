import { IExpectOpts } from '../types';
import * as ts from 'typescript';
import { resolve } from 'path';
import { createDebug } from '@umijs/utils';

const debug = createDebug('umi:dtstest');

const typeCheckFile = (files: string[]): boolean => {
  let program = ts.createProgram(files, {});

  let diagnostic: readonly ts.Diagnostic[] = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      diagnostic = [
        ...diagnostic,
        ...program.getSemanticDiagnostics(sourceFile),
      ];
    }
  }

  debug('diagnostic: ', diagnostic);
  return diagnostic.length === 0;
};

export default ({ indexCSS, files, cwd }: IExpectOpts) => {
  expect(indexCSS).toContain(`.a___`);
  expect(indexCSS).toContain(`.test___`);
  expect(typeCheckFile([resolve(cwd, 'index.ts')])).toBe(true);
};
