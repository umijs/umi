import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'outputPath',
    config: {
      default: 'dist',
      schema(joi) {
        return joi
          .string()
          .not('src', 'public', 'pages', 'mock', 'config')
          .allow('');
      },
    },
  });
};
