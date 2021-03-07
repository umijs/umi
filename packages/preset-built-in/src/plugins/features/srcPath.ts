import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'srcPath',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
  });
};
