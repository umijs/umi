import assert from 'assert';

export default function() {
  return {
    name: 'extraPostCSSPlugins',
    validate(val) {
      assert(Array.isArray(val), `The extraPostCSSPlugins config must be Array, but got ${val}`);
    },
  };
}
