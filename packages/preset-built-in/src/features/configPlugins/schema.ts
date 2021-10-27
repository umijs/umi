import type { Root } from '@umijs/core/compiled/@hapi/joi';

export function getSchemas(): Record<string, (joi: Root) => any> {
  return {
    plugins: (joi) => joi.array().items(joi.string()),
  };
}
