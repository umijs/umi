import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'babel',
    validate(val) {
      assert(isPlainObject(val), `The babel config must be Plain Object, but got ${val}`);
    },
  };
}
