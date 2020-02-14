import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'autoprefixer',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
