import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';

export default function() {
  return {
    name: 'loading',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item loading should be string, but got ${val}.`,
      );
      assert(
        existsSync(join(this.cwd, val)) ||
          existsSync(join(this.cwd, `${val}.js`)) ||
          existsSync(join(this.cwd, `${val}.jsx`)) ||
          existsSync(join(this.cwd, `${val}.ts`)) ||
          existsSync(join(this.cwd, `${val}.tsx`)),
        `File ${val} of configure item loading not found.`,
      );
    },
    onChange() {},
  };
}
