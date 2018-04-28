import assert from 'assert';

export default function() {
  return {
    name: 'es5ImcompatibleVersions',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The es5ImcompatibleVersions config must be Boolean, but got ${val}`,
      );
    },
  };
}
