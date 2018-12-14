import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'terserJSOptions',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'function',
        `The terserJSOptions config must be Plain Object or function, but got ${val}`,
      );
    },
  };
}
