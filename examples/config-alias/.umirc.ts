import { defineConfig } from 'umi';

export default defineConfig({
  alias: {
    component: require.resolve('./src/components'),
  },
});
