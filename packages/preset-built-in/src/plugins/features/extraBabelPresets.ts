import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'extraBabelPresets',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });
};
