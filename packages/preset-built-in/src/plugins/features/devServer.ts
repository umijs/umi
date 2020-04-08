import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'devServer',
    config: {
      schema(joi) {
        return joi
          .object({
            port: joi.number().description('devServer port, default 8000'),
            host: joi.string(),
            https: joi.alternatives(joi.object(), joi.boolean()),
            http2: joi.boolean(),
            headers: joi.object(),
          })
          .description('devServer configs')
          .unknown(true);
      },
    },
  });
};
