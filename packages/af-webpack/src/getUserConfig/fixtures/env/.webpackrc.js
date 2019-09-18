
export default {
  publicPath: '/foo/',
  alias: {
    a: 'a',
  },
  copy: ['a'],
  env: {
    test: {
      publicPath: '/bar/',
      alias: {
        b: 'b',
      },
      copy: ['b'],
    },
  },
};
