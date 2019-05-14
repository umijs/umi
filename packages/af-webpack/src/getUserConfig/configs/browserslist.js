import assert from 'assert';

export default function() {
  return {
    name: 'browserslist',
    validate(val) {
      assert(Array.isArray(val), `The browserslist config must be Array, but got ${val}`);
    },
  };
}
