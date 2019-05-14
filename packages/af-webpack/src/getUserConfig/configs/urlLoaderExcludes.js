import assert from 'assert';

export default function() {
  return {
    name: 'urlLoaderExcludes',
    validate(val) {
      assert(Array.isArray(val), `The urlLoaderExcludes config must be Array, but got ${val}`);
    },
  };
}
