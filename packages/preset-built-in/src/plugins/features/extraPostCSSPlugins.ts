import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'extraPostCSSPlugins',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });
};
