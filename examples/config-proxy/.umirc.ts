import { defineConfig } from 'umi';

const proxyMap = {
  dev: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  test: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
};

const { APP_ENV = 'dev' } = process.env;

export default defineConfig({
  proxy: proxyMap[APP_ENV],
});
