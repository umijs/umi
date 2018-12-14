import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'terserOptions',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'function',
        `The terserOptions config must be Plain Object or function, but got ${val}`,
      );
    },
  };
}
