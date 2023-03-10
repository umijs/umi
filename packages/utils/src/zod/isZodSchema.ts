import { z } from '../../compiled/zod';

export function isZodSchema<T extends z.ZodType<any>>(schema: T): boolean {
  return 'safeParse' in schema;
}
