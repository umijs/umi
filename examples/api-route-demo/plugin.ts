import * as path from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.addApiMiddlewares(() => [
    {
      name: 'loggerMiddleware',
      path: path.resolve(__dirname, './loggerMiddleware.ts'),
    },
  ]);
};
