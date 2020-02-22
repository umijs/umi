import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'manifest',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
