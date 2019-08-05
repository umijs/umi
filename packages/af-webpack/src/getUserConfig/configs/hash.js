import assert from 'assert';

export default function() {
  return {
    name: 'hash',
    validate(val) {
      assert(typeof val === 'boolean', `The hash config must be Boolean, but got ${val}`);
    },
    default: false,
    group: 'basic',
    type: 'boolean',
    description: 'Whether to enable the hash file suffix.',
  };
}
