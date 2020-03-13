import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'cssLoader',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
