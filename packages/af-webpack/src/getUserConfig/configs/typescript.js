import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'typescript',
    validate(val) {
      assert(isPlainObject(val), `The typescript config must be Plain Object, but got ${val}`);
    },
  };
}
