import assert from 'assert';

export default function() {
  return {
    name: 'disableCSSModules',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The disableCSSModules config must be Boolean, but got ${val}`,
      );
    },
  };
}
