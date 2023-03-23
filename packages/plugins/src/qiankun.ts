import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.union([
          zod
            .object({
              slave: zod.record(zod.any()),
              master: zod.record(zod.any()),
              externalQiankun: zod.boolean(),
            })
            .deepPartial(),
          // TODO  不允许输入 true
          zod.boolean(),
        ]);
      },
    },
  });

  api.addRuntimePluginKey(() => ['qiankun']);

  api.registerPlugins([
    require.resolve('./qiankun/master'),
    require.resolve('./qiankun/slave'),
  ]);
};
