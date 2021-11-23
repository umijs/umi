import type { Root } from '@umijs/core/compiled/@hapi/joi';
import { NpmClientEnum } from '@umijs/utils';

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    plugins: (Joi) => Joi.array().items(Joi.string()),
    publicPath: (Joi) =>
      Joi.string().regex(/\/$/).error(new Error('publicPath must end with /')),
    favicon: (Joi) => Joi.string(),
    headScripts: (Joi) => Joi.array().items(Joi.alternatives(Joi.string())),
    scripts: (Joi) => Joi.array().items(Joi.alternatives(Joi.string())),
    npmClient: (Joi) =>
      Joi.string().valid(
        NpmClientEnum.pnpm,
        NpmClientEnum.tnpm,
        NpmClientEnum.cnpm,
        NpmClientEnum.yarn,
        NpmClientEnum.npm,
      ),
    routes: (Joi) => Joi.array().items(Joi.object()),
  };
}
