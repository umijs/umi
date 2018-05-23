import assert from 'assert';

export default function(api) {
  return {
    name: 'disableHash',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item disableHash should be true or false, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item disableHash Changed.');
    },
  };
}
