import { defineConfig } from 'umi';

export default defineConfig({
  extraBabelPresets: [
    [
      '@babel/preset-react',
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
  extraBabelPlugins: ['@emotion/babel-plugin'],
});
