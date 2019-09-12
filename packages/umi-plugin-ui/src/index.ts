import { IApi } from 'umi-types';
import { join } from 'path';

export default (api: IApi) => {
  // TODO: 区分生产和开发环境，生产环境引打包好的，或者通过异步远程加载也可以
  api.addEntryCode(`
// Umi UI Bubble
require('${join(__dirname, '../bubble/index.tsx')}');
  `);

  require('./plugins/dashboard/index').default(api);
  // require('./plugins/blocks/index').default(api);
  require('./plugins/configuration/index').default(api);
  require('./plugins/tasks/index').default(api);
};
