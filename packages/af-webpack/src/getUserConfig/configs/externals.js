import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'externals',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'function',
        `The externals config must be Plain Object or Function, but got ${val}`,
      );
    },
  };
}
