import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'dev',
    description: 'dev server for development',
    details: `
umi dev

# dev with specified port
PORT=8888 umi dev
`,
    fn() {},
  });
};
