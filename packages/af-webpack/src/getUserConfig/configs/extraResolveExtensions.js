import assert from 'assert';

export default function() {
  return {
    name: 'extraResolveExtensions',
    validate(val) {
      assert(
        Array.isArray(val),
        `The extraResolveExtensions config must be Array, but got ${val}`,
      );
    },
  };
}
