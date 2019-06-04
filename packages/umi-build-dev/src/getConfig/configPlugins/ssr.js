import assert from 'assert';

export default function(api) {
  return {
    name: 'ssr',
    validate(val) {
      assert(
        val === true || val === false,
        `Configure item ssr should be true or false, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item ssr Changed.');
    },
  };
}
