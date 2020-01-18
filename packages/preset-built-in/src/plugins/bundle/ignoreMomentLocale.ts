import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'ignoreMomentLocale',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
