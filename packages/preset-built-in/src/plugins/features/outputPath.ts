import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'outputPath',
    config: {
      default: 'dist',
      schema(joi) {
        return joi.string().allow('');
      },
    },
  });
};
