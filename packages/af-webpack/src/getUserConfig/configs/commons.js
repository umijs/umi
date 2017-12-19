import assert from 'assert';

export default function() {
  return {
    name: 'commons',
    validate(val) {
      // TODO: 校验数组项的构成
      assert(
        Array.isArray(val),
        `The commons config must be Array, but got ${val}`,
      );
    },
  };
}
