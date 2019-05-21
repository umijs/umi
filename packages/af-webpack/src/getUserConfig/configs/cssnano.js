import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'cssnano',
    validate(val) {
      assert(isPlainObject(val), `The cssnano config must be Plain Object, but got ${val}`);
    },
  };
}
