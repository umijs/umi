import assert from 'assert';

export default function(api) {
  return {
    name: 'routes',
    validate(val) {
      assert(
        Array.isArray(val),
        `Configure item routes should be Array, but got ${val.toString()}.`,
      );
    },
    onChange() {
      api.service.rebuildTmpFiles();
    },
  };
}
