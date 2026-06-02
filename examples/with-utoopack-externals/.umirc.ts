import { defineConfig } from 'umi';

export default defineConfig({
  utoopack: {
    optimization: {
      moduleIds: 'named',
    },
  },
  externals: {
    'lodash/*': 'lodash',
    'lodash/fp/*': 'lodash',
  },
});
