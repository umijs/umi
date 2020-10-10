import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'presets',
    config: {
      schema(joi) {
        return joi.array().items(joi.string());
      },
    },
  });
};
