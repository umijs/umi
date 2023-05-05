import type { ZodTypeAny } from '@umijs/utils/compiled/zod';

export type LiteralType = string | number | boolean;

export type ZodToTsOptions = {
  // TODO: support Native enum
  // resolveNativeEnums?: boolean;
  // TODO: support lazy type
};

export interface IZodToTsOpts {
  zod: ZodTypeAny;
  identifier?: string;
  options?: ZodToTsOptions;
}
