import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'publicPath',
    config: {
      default: '/',
      schema(joi) {
        return joi.string();
      },
    },
  });
};
