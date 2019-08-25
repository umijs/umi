import assert from 'assert';

export default function() {
  return {
    name: 'generateCssModulesTypings',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The generateCssModulesTypings config must be Boolean, but got ${val}`,
      );
    },
  };
}
