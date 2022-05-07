import type { IApi } from 'umi';
import './requireHook';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {},
    },
  });

  return {
    plugins: [
      require.resolve('./features/default'),
      require.resolve('./features/webpack'),
      require.resolve('./features/tmpFiles/tmpFiles'),
      require.resolve('./features/vite/vite'),
    ],
  };
};
