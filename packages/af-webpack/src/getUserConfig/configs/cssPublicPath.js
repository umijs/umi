import assert from 'assert';

export default function() {
  return {
    name: 'cssPublicPath',
    validate(val) {
      assert(typeof val === 'string', `The cssPublicPath config must be String, but got ${val}`);
    },
  };
}
