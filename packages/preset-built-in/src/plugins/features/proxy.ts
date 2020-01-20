import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'proxy',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
