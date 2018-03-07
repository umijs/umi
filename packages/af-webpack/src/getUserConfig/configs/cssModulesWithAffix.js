import assert from 'assert';

export default function() {
  return {
    name: 'cssModulesWithAffix',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The cssModulesWithAffix config must be Boolean, but got ${val}`,
      );
    },
  };
}
