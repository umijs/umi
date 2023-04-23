import { defineConfig } from 'umi';
export default defineConfig({
  plugins: [require.resolve('./plugin2')],
  npmClient: 'pnpm',
  hello1: {},
  hello: {
    abc: ['123'],
    bc: 222,
  },
});
