import assert from 'assert';

export default function() {
  return {
    name: 'extraBabelPlugins',
    validate(val) {
      assert(Array.isArray(val), `The extraBabelPlugins config must be Array, but got ${val}`);
    },
  };
}
