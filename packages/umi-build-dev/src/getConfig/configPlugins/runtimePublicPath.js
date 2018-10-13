import assert from 'assert';

export default function(api) {
  return {
    name: 'runtimePublicPath',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item runtimePublicPath should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(
        /* why */ 'Configure item runtimePublicPath Changed.',
      );
    },
  };
}
