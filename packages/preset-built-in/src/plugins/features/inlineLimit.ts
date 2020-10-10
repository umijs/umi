import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'inlineLimit',
    config: {
      schema(joi) {
        return joi.number();
      },
    },
  });
};
