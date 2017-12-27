import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'manifest',
    validate(val) {
      assert(
        isPlainObject(val),
        `The entry config must be Plain Object, but got ${val}`,
      );
    },
  };
}
