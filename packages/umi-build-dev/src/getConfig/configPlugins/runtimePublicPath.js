import assert from 'assert';

export default function(api) {
  return {
    name: 'runtimePublicPath',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `Configure item runtimePublicPath should be Boolean, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Configure item runtimePublicPath Changed.');
    },
    default: false,
    type: 'boolean',
    group: 'basic',
    description: 'Whether to use the window.publicPath specified in the HTML.',
  };
}
