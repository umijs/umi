import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'cssModulesTypescriptLoader',
    config: {
      schema(joi) {
        return joi.object({
          mode: joi.string().valid('emit', 'verify').optional(),
        });
      },
    },
  });
};
