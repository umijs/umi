import assert from 'assert';

export default function(api) {
  return {
    name: 'disableDynamicImport',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item disableDynamicImport should be true or false, but got ${val}.`,
      );
    },
  };
}
