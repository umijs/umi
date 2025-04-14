import { writeFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.onStart(() => {
    api.logger.info('api.paths.absTmpPath', api.paths.absTmpPath);
    api.logger.info('api.paths.cwd', api.paths.cwd);

    writeFileSync(join(api.paths.absTmpPath, 'app.json'), '{}', 'utf-8');

    // writeFileSync(
    //   join(api.paths.cwd, 'app.json'),
    //   JSON.stringify(api.appData, null, 2),
    //   'utf-8',
    // );
  });
  api.onGenerateFiles(() => {
    api.logger.info('onGenerateFiles');
    api.writeTmpFile({
      path: 'appData.json',
      content: JSON.stringify('{}', null, 2),
    });
  });
};
