import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'cssLoader',
    config: {
      schema(joi) {
        return joi
          .object({
            url: joi.alternatives(joi.boolean(), joi.function()),
            import: joi.alternatives(joi.boolean(), joi.function()),
            modules: joi.alternatives(
              joi.boolean(),
              joi.string(),
              joi.object(),
            ),
            sourceMap: joi.boolean(),
            importLoaders: joi.number(),
            onlyLocals: joi.boolean(),
            esModule: joi.boolean(),
            localsConvention: joi
              .string()
              .valid(
                'asIs',
                'camelCase',
                'camelCaseOnly',
                'dashes',
                'dashesOnly',
              ),
          })
          .description(
            'more css-loader options see https://webpack.js.org/loaders/css-loader/#options',
          );
      },
    },
  });
};
