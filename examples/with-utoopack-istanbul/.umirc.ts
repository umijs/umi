import { defineConfig } from 'umi';

export default defineConfig({
  utoopack: {
    babelLoader: true,
  },
  extraBabelPlugins: ['babel-plugin-istanbul'],
});
