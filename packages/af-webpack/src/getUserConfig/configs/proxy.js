import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'proxy',
    validate(val) {
      assert(
        isPlainObject(val),
        `The proxy config must be Plain Object, but got ${val}`,
      );
    },
  };
}
