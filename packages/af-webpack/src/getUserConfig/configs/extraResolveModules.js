import assert from 'assert';

export default function() {
  return {
    name: 'extraResolveModules',
    validate(val) {
      assert(
        Array.isArray(val),
        `The extraResolveModules config must be Array, but got ${val}`,
      );
    },
  };
}
