import assert from 'assert';
import { isPlainObject, isArrayLikeObject } from 'lodash';

export default function() {
  return {
    name: 'proxy',
    validate(val) {
      assert(
        isPlainObject(val) || isArrayLikeObject(val),
        `The proxy config must be Plain Object or Array-like Object, but got ${val}`,
      );
    },
  };
}
