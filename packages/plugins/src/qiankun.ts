import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.alternatives().try(
          Joi.object().keys({
            slave: Joi.object(),
            master: Joi.object(),
            externalQiankun: Joi.boolean(),
          }),
          Joi.boolean().invalid(true),
        );
      },
    },
  });

  api.addRuntimePluginKey(() => ['qiankun']);

  api.registerPlugins([
    require.resolve('./qiankun/master'),
    require.resolve('./qiankun/slave'),
  ]);
};
