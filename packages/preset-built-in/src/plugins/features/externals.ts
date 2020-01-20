import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'externals',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
