import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function() {
  return {
    name: 'lessLoaderOptions',
    validate(val) {
      assert(
        isPlainObject(val),
        `The lessLoaderOptions config must be Plain Object, but got ${val}`,
      );
    },
  };
}
