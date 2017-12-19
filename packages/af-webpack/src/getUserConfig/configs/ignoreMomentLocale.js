import assert from 'assert';

export default function() {
  return {
    name: 'ignoreMomentLocale',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The ignoreMomentLocale config must be Boolean, but got ${val}`,
      );
    },
  };
}
