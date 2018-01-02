import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'html',
    validate(val) {
      assert(
        isPlainObject(val),
        `The html config must be Plain Object, but got ${val}`,
      );
    },
  };
}
