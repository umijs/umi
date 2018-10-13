import assert from 'assert';

export default function() {
  return {
    name: 'outputPath',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item outputPath should be String, but got ${val}.`,
      );
    },
  };
}
