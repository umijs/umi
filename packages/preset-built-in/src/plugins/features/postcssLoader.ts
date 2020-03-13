import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'postcssLoader',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
