import assert from 'assert';

export default function() {
  return {
    name: 'preact',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item preact should be true or false, but got ${val}.`,
      );
    },
    onChange() {
      this.restart(/* why */ 'Configure item preact Changed.');
    },
  };
}
