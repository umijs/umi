import { defineConfig } from 'umi';

export default defineConfig({
  // utoopack: {},
  mako: {},
  proxy: {
    '/ws': {
      target: 'ws://127.0.0.1:3000',
      changeOrigin: true,
      ws: true,
    },
  },
});
