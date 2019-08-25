import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'styleLoader',
    validate(val) {
      assert(isPlainObject(val), `The styleLoader config must be Plain Object, but got ${val}`);
    },
  };
}
