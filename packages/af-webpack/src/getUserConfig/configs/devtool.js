import assert from 'assert';

export default function() {
  return {
    name: 'devtool',
    validate(val) {
      assert(typeof val === 'string', `The devtool config must be String, but got ${val}`);
    },
  };
}
