import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function(api) {
  return {
    name: 'context',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `Configure item context should be Boolean or Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config context Changed');
    },
  };
}
