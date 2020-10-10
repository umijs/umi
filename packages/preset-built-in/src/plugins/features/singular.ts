import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'singular',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
