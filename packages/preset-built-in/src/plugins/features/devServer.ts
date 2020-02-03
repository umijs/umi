import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'devServer',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
