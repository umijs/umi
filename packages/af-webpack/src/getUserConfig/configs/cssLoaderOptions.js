import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'cssLoaderOptions',
    validate(val) {
      assert(
        isPlainObject(val),
        `The cssLoaderOptions config must be Plain Object, but got ${val}`,
      );
    },
  };
}
