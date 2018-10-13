import assert from 'assert';

export default function(api) {
  return {
    name: 'disableRedirectHoist',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `disableRedirectHoist should be Boolean, but got ${val.toString()}.`,
      );
    },
    onChange() {
      api.service.rebuildTmpFiles();
    },
  };
}
