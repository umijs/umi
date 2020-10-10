import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'plugins',
    config: {
      schema(joi) {
        return joi.array().items(joi.string());
      },
    },
  });
};
