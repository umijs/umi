import { join } from 'path';
import { TEMPLATES_DIR } from '../constants';
import { IApi } from '../types';

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        rendererPath: require.resolve('@umijs/renderer-react'),
      },
    });
  });
};
