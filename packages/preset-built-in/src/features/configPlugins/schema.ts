import type { Root } from '@umijs/core/compiled/@hapi/joi';

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    plugins: (Joi) => Joi.array().items(Joi.string()),
    favicon: (Joi) => Joi.string(),
    headScripts: (Joi) => Joi.array().items(Joi.alternatives(Joi.string())),
    scripts: (Joi) => Joi.array().items(Joi.alternatives(Joi.string())),
  };
}
