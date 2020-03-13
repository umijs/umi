import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'autoprefixer',
    config: {
      default: {
        flexbox: 'no-2009',
      },
      schema(joi) {
        return joi.object();
      },
    },
  });
};
