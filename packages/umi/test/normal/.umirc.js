const port = process.env.PORT || 12341;

export default {
  mountElementId: 'testroot',
  proxy: {
    '/proxy/proxytest': {
      target: `http://localhost:${port}`,
      changeOrigin: true,
      pathRewrite: { '^/proxy': '/api' },
    },
    '/proxy/proxytest2': {
      target: `http://localhost:${port}`,
      changeOrigin: true,
      pathRewrite: { '^/proxy': '/api' },
    },
  },
};
