import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'stylus',
    validate(val) {
      assert(isPlainObject(val), `The stylus config must be Plain Object, but got ${val}`);
    },
  };
}
