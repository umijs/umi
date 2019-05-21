import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'env',
    validate(val) {
      assert(isPlainObject(val), `The env config must be Plain Object, but got ${val}`);
    },
  };
}
