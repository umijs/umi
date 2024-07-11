import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'routePicker',
    config: {
      schema({ zod }) {
        return zod.array(zod.string());
      },
    },
    enableBy: () => {
      return api.name === 'dev';
    },
  });

  console.log('插件 picker 注册');

  api.onCheck(async () => {
    // console.log('插件', api.appData.routes);
    console.log('插件config', api.config);
    api.config.routes = [
      {
        path: '/',
        component: 'index',
      },
    ];
  });
};
