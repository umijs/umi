import assert from 'assert';

export default function() {
  return {
    name: 'enableExtractDevCSS',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `The enableExtractDevCSS config must be Boolean, but got ${val}`,
      );
    },
  };
}
