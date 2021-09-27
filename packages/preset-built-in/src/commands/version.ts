import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'version',
    description: 'show umi version',
    fn() {
      console.log(`umi@${require('../../package.json').version}`);
    },
  });
};
