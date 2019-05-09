import assert from 'assert';

export default function(api) {
  return {
    name: 'disableGlobalVariables',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `disableGlobalVariables should be Boolean, but got ${val.toString()}.`,
      );
    },
    onChange() {
      api.service.rebuildTmpFiles();
    },
  };
}
