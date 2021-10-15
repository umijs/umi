import type { Root } from '@hapi/joi';

export function getSchemas(): Record<string, (joi: Root) => any> {
  return {
    alias: (joi) => joi.object(),
  };
}
