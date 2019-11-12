import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function(api) {
  return {
    name: 'ssr',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `Configure item ssr should be Boolean or Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item ssr Changed.');
    },
  };
}
