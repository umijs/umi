import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'serviceworker',
    validate(val) {
      assert(
        isPlainObject(val),
        `The serviceworker config must be Plain Object, but got ${val}`,
      );
    },
  };
}
