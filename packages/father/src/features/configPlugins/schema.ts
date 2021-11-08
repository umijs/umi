import type { Root } from '@umijs/core/compiled/@hapi/joi';

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    esm: (Joi) =>
      Joi.object({
        input: Joi.string(),
        output: Joi.string(),
        transformer: Joi.string(),
        overrides: Joi.object(),
      }),
  };
}
