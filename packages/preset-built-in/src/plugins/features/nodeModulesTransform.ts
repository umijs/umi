import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'nodeModulesTransform',
    config: {
      default: {
        type: 'all',
        exclude: [],
      },
      schema(joi) {
        return joi.object({
          type: joi.string().valid('all', 'none'),
          exclude: joi.array().items(joi.string()),
        });
      },
    },
  });
};
