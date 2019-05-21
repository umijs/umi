import assert from 'assert';

export default function() {
  return {
    name: 'outputPath',
    validate(val) {
      assert(typeof val === 'string', `The outputPath config must be String, but got ${val}`);
    },
  };
}
