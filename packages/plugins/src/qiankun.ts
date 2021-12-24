import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(joi) {
        return joi.object().keys({
          slave: joi.object(),
          master: joi.object(),
        });
      },
    },
  });

  api.addRuntimePluginKey(() => ['qiankun']);

  api.registerPlugins([
    require.resolve('./qiankun/master'),
    require.resolve('./qiankun/slave'),
  ]);
};
