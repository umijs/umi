import assert from 'assert';

export default function() {
  return {
    name: 'manifest',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The manifest config must be Boolean, but got ${val}`,
      );
    },
  };
}
