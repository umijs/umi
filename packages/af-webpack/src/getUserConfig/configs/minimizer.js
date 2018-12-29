import assert from 'assert';

export default function() {
  return {
    name: 'minimizer',
    validate(val) {
      assert(
        val === 'terserjs' || val === 'uglifyjs',
        `minimizer should be terserjs or uglifyjs, but got ${val}`,
      );
    },
  };
}
