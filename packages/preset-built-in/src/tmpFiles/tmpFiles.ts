import { join } from 'path';
import { TEMPLATES_DIR } from '../constants';
import { IApi } from '../types';

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    // umi.ts
    api.writeTmpFile({
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        rendererPath: require.resolve('@umijs/renderer-react'),
      },
    });

    // routes.ts
    api.writeTmpFile({
      path: 'core/routes.ts',
      tplPath: join(TEMPLATES_DIR, 'routes.tpl'),
      context: {},
    });
  });
};
