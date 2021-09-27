import { IApi } from 'umi';

export default (api: IApi) => {
  api.registerCommand({
    name: 'help',
    description: 'show command help',
    fn() {
      console.log(`umi help`);
    },
  });
};
