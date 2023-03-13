import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'cache',
    config: {},
  });

  api.registerCommand({
    name: 'cache',
    description: 'run the script commands, manage umi cache',
    configResolveMode: 'loose',
    fn: ({ args }) => {
      console.log(args);
    },
  });
};
