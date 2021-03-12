import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'manifest',
    config: {
      schema(joi) {
        return joi.object({
          fileName: joi.string(),
          // eggjs need
          publicPath: joi.string().allow(''),
          basePath: joi.string(),
          writeToFileEmit: joi.boolean(),
        });
      },
    },
  });
};
