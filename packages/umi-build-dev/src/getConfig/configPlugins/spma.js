import assert from 'assert';

// TODO: move to @ali/umi
export default function() {
  return {
    name: 'spma',
    validate(val) {
      assert(
        typeof val === 'string',
        `Configure item spma should be String, but got ${val}.`,
      );
    },
  };
}
