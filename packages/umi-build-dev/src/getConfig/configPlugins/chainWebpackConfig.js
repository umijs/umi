import assert from 'assert';

export default function(api) {
  return {
    name: 'chainWebpackConfig',
    validate(val) {
      assert(
        typeof val === 'function',
        `Configure item outputPath should be Function, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(
        /* why */ 'Configure item chainWebpackConfig Changed.',
      );
    },
  };
}
