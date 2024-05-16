import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema({ zod }) {
        return zod.object({});
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
