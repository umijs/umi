import ts from 'typescript';

export type LiteralType = string | number | boolean;

export type ZodToTsOptions = {
  resolveNativeEnums?: boolean;
};

export type RequiredZodToTsOptions = Required<ZodToTsOptions>;

export type ZodToTsStore = {
  nativeEnums: ts.EnumDeclaration[];
};

export type ZodToTsReturn = {
  node: ts.TypeNode;
  store: ZodToTsStore;
};

export type GetTypeFunction = (
  typescript: typeof ts,
  identifier: string,
  options: RequiredZodToTsOptions,
) => ts.Identifier | ts.TypeNode;

export type GetType = { getType?: GetTypeFunction };
