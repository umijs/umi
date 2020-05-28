import { defineConfig } from 'umi';

export default defineConfig({
  ssr: {
    devServerRender: false,
  },
  outputPath: '../public',
  // for dev server
  publicPath: 'http://localhost:8000/',
  runtimePublicPath: true,
});
