import assert from 'assert';

export default function() {
  return {
    name: 'chainConfig',
    validate(val) {
      assert(typeof val === 'function', `The chainConfig config must be Function, but got ${val}`);
    },
  };
}
