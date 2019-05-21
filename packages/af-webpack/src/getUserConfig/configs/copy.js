import assert from 'assert';

export default function() {
  return {
    name: 'copy',
    validate(val) {
      assert(Array.isArray(val), `The copy config must be Array, but got ${val}`);
    },
  };
}
