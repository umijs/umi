import assert from 'assert';

export default function(api) {
  return {
    name: 'plugins',
    validate(val) {
      assert(
        Array.isArray(val),
        `Configure item plugins should be Array, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config plugins Changed');
    },
  };
}
