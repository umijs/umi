import assert from 'assert';

export default function() {
  return {
    name: 'disableDynamicImport',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The disableDynamicImport config must be Boolean, but got ${val}`,
      );
    },
  };
}
