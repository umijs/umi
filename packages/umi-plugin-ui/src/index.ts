import { IApi } from 'umi-types';
import { join } from 'path';

export default (api: IApi) => {
  api.addEntryCode(`
// Umi UI Bubble
require('${join(__dirname, '../bubble/index.js')}');
  `);

  require('./plugins/dashboard/index').default(api);
  // require('./plugins/blocks/index').default(api);
  require('./plugins/configuration/index').default(api);
  require('./plugins/tasks/index').default(api);
};
