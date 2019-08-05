import assert from 'assert';

export default function() {
  return {
    name: 'publicPath',
    validate(val) {
      assert(typeof val === 'string', `The publicPath config must be String, but got ${val}`);
    },
    default: '/',
    type: 'string',
    group: 'basic',
    description: 'The publicPath of your assets.',
  };
}
