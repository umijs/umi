import assert from 'assert';

export default function(api) {
  return {
    name: 'preact',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item preact should be true or false, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item preact Changed.');
    },
  };
}
