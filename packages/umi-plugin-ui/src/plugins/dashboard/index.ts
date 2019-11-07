import request from 'umi-request';
import { IApi } from 'umi-types';

export default (api: IApi) => {
  // let resources: Resource[] = [];
  // resources = api.applyPlugins('addBlockUIResource', {
  //   initialValue: DEFAULT_RESOURCES,
  // });
  // resources = api.applyPlugins('modifyBlockUIResources', {
  //   initialValue: resources,
  // });
  // register backend service API
  api.onUISocket(async ({ action, failure, success, send }) => {
    const { type, payload = {}, lang } = action;
    switch (type) {
      case 'org.umi.dashboard.card.list': {
        success([
          {
            id: 1,
            title: '任务',
            description: '这是一段构建的描述信息',
            enable: true,
          },
          {
            id: 2,
            title: '云谦早报',
            description: '这是一段构建的描述信息',
            enable: true,
          },
          {
            id: 3,
            title: 'Bigfish 精选',
            description: '这是一段构建的描述信息',
            enable: false,
          },
        ]);
        break;
      }
      case 'org.umi.dashboard.zaobao.list': {
        const result = await request('https://ui.umijs.org/api/index');
        success(result);
        break;
      }
      default:
        break;
    }
  });
  api.addUIPlugin(require.resolve('../../../src/plugins/dashboard/dist/ui.umd'));
};
