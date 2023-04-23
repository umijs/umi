export default {
  // 1
  // proxy: {
  //   '/api': {
  //     target: 'https://jsonplaceholder.typicode.com/',
  //     changeOrigin: true,
  //     pathRewrite: { '^/api': '' },
  //   },
  // },
  // vite: {},
  // 2
  // proxy: {
  //   context: ['/api', '/foooo'],
  //   target: 'https://jsonplaceholder.typicode.com/',
  //   changeOrigin: true,
  //   pathRewrite: { '^/api': '' },
  // },
  // 3
  proxy: [
    {
      context: ['/api', '/foooo'],
      target: 'https://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        console.log(proxyReq);
      },
      pathRewrite: { '^/api': '', '^/foooo': '' },
    },
  ],
};
