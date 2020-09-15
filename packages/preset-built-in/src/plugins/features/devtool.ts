import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'devtool',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
  });
};
