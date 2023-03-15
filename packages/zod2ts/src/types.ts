import type { ZodTypeAny } from '@umijs/utils/compiled/zod';

export type LiteralType = string | number | boolean;

export type ZodToTsOptions = {
  // TODO: support Native enum
  // resolveNativeEnums?: boolean;

  /**
   * ket type of `zod.lazy`
   * @example zod schema   : { key: z.lazy() }
   *          lazyTypesMap : { key: (identifier) => `${identifier}['key']` }
   *          result       : interface IExample { key: IExample['key'] }
   *                                                   ^^^^^^^^^^^^ nested type
   */
  lazyTypesMap?: Record<string, string | ((identifier: string) => string)>;
};

export interface IZodToTsOpts {
  zod: ZodTypeAny;
  identifier?: string;
  options?: ZodToTsOptions;
}
