import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'hash',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
