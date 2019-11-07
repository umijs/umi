import assert from 'assert';

export default function(api) {
  return {
    name: 'disableGlobalVariables',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item disableGlobalVariables should be Boolean, but got ${val.toString()}.`,
      );
    },
    onChange() {
      api.service.rebuildTmpFiles();
    },
  };
}
