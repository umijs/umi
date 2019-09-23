import assert from 'assert';

export default function(api) {
  return {
    name: 'singular',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item singular should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item singular Changed.');
    },
  };
}
