import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'define',
    config: {
      default: {
        'process.env.__IS_BROWSER': true,
      },
      schema(joi) {
        return joi.object();
      },
    },
  });
};
