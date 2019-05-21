import assert from 'assert';

export default function() {
  return {
    name: 'extraBabelPresets',
    validate(val) {
      assert(Array.isArray(val), `The extraBabelPresets config must be Array, but got ${val}`);
    },
  };
}
