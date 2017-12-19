import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'define',
    validate(val) {
      assert(
        isPlainObject(val),
        `The define config must be Plain Object, but got ${val}`,
      );
    },
  };
}
