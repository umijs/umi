import assert from 'assert';
import { isPlainObject } from 'lodash';
import { existsSync } from 'fs';
import { join, isAbsolute } from 'path';

export default function() {
  return {
    name: 'theme',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'string',
        `The theme config must be Plain Object or String, but got ${val}`,
      );

      const { cwd } = this;
      if (typeof val === 'string') {
        const themeFile = isAbsolute(val) ? val : join(cwd, val);
        assert(existsSync(themeFile), `File ${val} of configure item theme not found.`);
      }
    },
  };
}
