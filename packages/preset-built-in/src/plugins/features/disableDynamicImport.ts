import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'disableDynamicImport',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
