import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'devServer',
    config: {
      schema(joi) {
        return joi
          .object({
            port: joi.number(),
            host: joi.string(),
            https: joi.alternatives(joi.object(), joi.boolean()),
            http2: joi.boolean(),
            headers: joi.object(),
          })
          .unknown(true);
      },
    },
  });
};
