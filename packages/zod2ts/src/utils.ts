import type { ZodTypeAny } from '@umijs/utils/compiled/zod';
import ts from 'typescript';
import type { GetType, GetTypeFunction } from './types';
const { factory: f } = ts;

export const maybeIdentifierToTypeReference = (
  identifier: ts.Identifier | ts.TypeNode,
) => {
  if (ts.isIdentifier(identifier)) {
    return f.createTypeReferenceNode(identifier);
  }

  return identifier;
};

export const createTypeReferenceFromString = (identifier: string) =>
  f.createTypeReferenceNode(f.createIdentifier(identifier));

export const createUnknownKeywordNode = () =>
  f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

export const createTypeAlias = (
  node: ts.TypeNode,
  identifier: string,
  comment?: string,
) => {
  const typeAlias = f.createTypeAliasDeclaration(
    undefined,
    f.createIdentifier(identifier),
    undefined,
    node,
  );

  if (comment) {
    addJsDocComment(typeAlias, comment);
  }

  return typeAlias;
};

export const printNode = (
  node: ts.Node,
  printerOptions?: ts.PrinterOptions,
) => {
  const sourceFile = ts.createSourceFile(
    'print.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const printer = ts.createPrinter(printerOptions);
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
};

export const withGetType = <T extends ZodTypeAny & GetType>(
  schema: T,
  getType: GetTypeFunction,
): T => {
  schema.getType = getType;
  return schema;
};

const identifierRE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export const getIdentifierOrStringLiteral = (str: string) => {
  if (identifierRE.test(str)) {
    return f.createIdentifier(str);
  }

  return f.createStringLiteral(str);
};

export const addJsDocComment = (node: ts.Node, text: string) => {
  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `* ${text} `,
    true,
  );
};
