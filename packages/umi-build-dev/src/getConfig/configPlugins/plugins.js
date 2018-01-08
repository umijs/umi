import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function() {
  return {
    name: 'plugins',
    validate(val) {
      assert(
        Array.isArray(val),
        `Configure item plugins should be Array, but got ${val}.`,
      );
    },
    onChange() {
      this.restart(/* why */ 'Config plugins Changed');
    },
  };
}
