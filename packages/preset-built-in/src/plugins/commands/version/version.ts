import { IApi } from '@umijs/types';

export default (api: IApi) => {
  const {
    cwd,
    paths,
    utils: { rimraf, chalk },
  } = api;

  api.registerCommand({
    name: 'version',
    fn: async function() {},
  });
};
