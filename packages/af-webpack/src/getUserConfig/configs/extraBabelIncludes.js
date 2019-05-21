import assert from 'assert';

export default function() {
  return {
    name: 'extraBabelIncludes',
    validate(val) {
      assert(Array.isArray(val), `The extraBabelIncludes config must be Array, but got ${val}`);
    },
  };
}
