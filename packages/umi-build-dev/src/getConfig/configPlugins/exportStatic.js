import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function(api) {
  return {
    name: 'exportStatic',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `Configure item context should be Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config exportStatic Changed');
    },
  };
}
