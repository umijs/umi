export default {
  // 1
  // proxy: {
  //   '/api': {
  //     target: 'https://jsonplaceholder.typicode.com/',
  //     'changeOrigin': true,
  //     'pathRewrite': { '^/api' : '' },
  //   },
  // },
  // 2
  // proxy: {
  //   context: ['/api', '/foooo'],
  //   target: 'https://jsonplaceholder.typicode.com/',
  //   'changeOrigin': true,
  //   'pathRewrite': { '^/api' : '' },
  // },
  // 3
  proxy: [
    {
      context: ['/api', '/foooo'],
      target: 'https://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '', '^/foooo': '' },
    },
  ],
};
