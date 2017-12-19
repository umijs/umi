import assert from 'assert';

export default function() {
  return {
    name: 'disableCSSSourceMap',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The disableCSSSourceMap config must be Boolean, but got ${val}`,
      );
    },
  };
}
