import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

const devToolAppDist = join(__dirname, '../../../devToolAppDist');

export default (api: IApi) => {
  api.addBeforeMiddlewares(() => {
    return [
      (req, res, next) => {
        const { path } = req;

        // api
        if (path.startsWith('/__umi/api/')) {
          const shortPath = path.replace('/__umi/api/', '');
          if (shortPath === 'config') {
            return res.json(api.config);
          }
          if (shortPath === 'app-data') {
            return res.json(api.appData);
          }
          return next();
        }

        // static
        if (path.startsWith('/__umi/')) {
          const shortPath = path.replace('/__umi/', '');
          if (shortPath !== '' && existsSync(join(devToolAppDist, shortPath))) {
            return res.sendFile(join(devToolAppDist, shortPath));
          } else {
            return res.sendFile(join(devToolAppDist, 'index.html'));
          }
        }

        return next();
      },
    ];
  });
};
