import { z } from '../../compiled/zod';

export function zod2string<T extends z.ZodType<any>>(schema: T): string {
  if (schema instanceof z.ZodObject) {
    const keys = Object.keys(schema.shape);
    const properties = keys
      .map((key) => `${key}: ${zod2string(schema.shape[key])}`)
      .join(', ');
    return `z.object({${properties}})`;
  } else if (schema instanceof z.ZodArray) {
    return `z.array(${zod2string(schema._def.type)})`;
  } else if (schema instanceof z.ZodOptional) {
    return `z.optional(${zod2string(schema._def.innerType)})`;
  } else {
    const { typeName, checks } = schema._def as z.ZodStringDef;
    let str = `z.${typeName.replace('Zod', '').toLowerCase()}()`;
    if (checks && checks.length > 0) {
      checks.forEach((i) => {
        str += `.${i.kind}(${(i as any)?.value || ''})`;
      });
    }
    return str;
  }
}
