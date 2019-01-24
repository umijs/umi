import assert from 'assert';

export default function(api) {
  return {
    name: 'treeShaking',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item treeShaking should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item treeShaking Changed.');
    },
  };
}
