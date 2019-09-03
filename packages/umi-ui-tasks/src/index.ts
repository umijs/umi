import { join } from 'path';
import { IApi } from 'umi-types';
import server from './server';

export default (api: IApi) => {
  api.addUIPlugin(join(__dirname, '../dist/ui.umd.js'));
  server(api);
};
