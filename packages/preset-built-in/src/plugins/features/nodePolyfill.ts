import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'nodePolyfill',
    config: {
      default: true,
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
