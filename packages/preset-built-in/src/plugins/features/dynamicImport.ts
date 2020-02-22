import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'dynamicImport',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
