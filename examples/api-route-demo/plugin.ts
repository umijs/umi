import * as path from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.addApiMiddlewares(() => [
    {
      name: 'authMiddleware',
      path: path.resolve(__dirname, './authMiddleware.ts'),
    },
  ]);
};
