import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'terserOptions',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
