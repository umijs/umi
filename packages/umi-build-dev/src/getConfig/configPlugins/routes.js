import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { cwd } = api.service.paths;

  return {
    name: 'routes',
    validate(val) {
      assert(
        Array.isArray(val),
        `routes should be Array, but got ${val.toString()}.`,
      );
    },
    onChange(newConfig) {
      api.service.config = newConfig;
      api.service.filesGenerator.rebuild();
    },
  };
}
