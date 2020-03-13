import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'targets',
    config: {
      default: {
        node: true,
        chrome: 49,
        firefox: 64,
        safari: 10,
        edge: 13,
        ios: 10,
      },
      schema(joi) {
        return joi.object();
      },
    },
  });
};
