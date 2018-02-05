import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  return {
    name: 'loading',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item loading should be string, but got ${val}.`,
      );
      const { cwd } = api.service.paths;
      assert(
        existsSync(join(cwd, val)) ||
          existsSync(join(cwd, `${val}.js`)) ||
          existsSync(join(cwd, `${val}.jsx`)) ||
          existsSync(join(cwd, `${val}.ts`)) ||
          existsSync(join(cwd, `${val}.tsx`)),
        `File ${val} of configure item loading not found.`,
      );
    },
    onChange() {},
  };
}
