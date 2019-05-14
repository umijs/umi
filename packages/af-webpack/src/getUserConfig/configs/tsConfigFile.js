import assert from 'assert';

export default function() {
  return {
    name: 'tsConfigFile',
    validate(val) {
      assert(typeof val === 'string', `The tsConfigFile config must be String, but got ${val}`);
    },
  };
}
