import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'extraBabelIncludes',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });
};
