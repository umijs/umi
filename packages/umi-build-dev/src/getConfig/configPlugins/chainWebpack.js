import assert from 'assert';

export default function(api) {
  return {
    name: 'chainWebpack',
    validate(val) {
      assert(
        typeof val === 'function',
        `Configure item chainWebpack should be Function, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item chainWebpack Changed.');
    },
  };
}
