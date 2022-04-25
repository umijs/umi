import { cheerio } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

const devToolAppDist = join(__dirname, '../../../devToolAppDist');
const assetsDir = join(__dirname, '../../../assets');

export default (api: IApi) => {
  api.addBeforeMiddlewares(async () => {
    // get loading html
    const $ = await api.applyPlugins<typeof cheerio>({
      key: 'modifyDevToolLoadingHTML',
      type: api.ApplyPluginsType.modify,
      initialValue: cheerio.load(
        readFileSync(join(assetsDir, 'bundle-status.html'), 'utf-8'),
      ),
    });
    const loadingHtml = $.html();

    return [
      (req, res, next) => {
        const { path } = req;

        const enableVite = api.appData.vite;

        // api
        if (path.startsWith('/__umi/api/')) {
          const shortPath = path.replace('/__umi/api/', '');
          if (shortPath === 'config') {
            return res.json(api.config);
          }
          if (shortPath === 'app-data') {
            return res.json(api.appData);
          }
          if (shortPath === 'bundle-status') {
            const isMFSUEnable = api.config.mfsu !== false;

            return res.json({
              bundleStatus: api.appData.bundleStatus,
              ...(isMFSUEnable && !enableVite
                ? {
                    mfsuBundleStatus: api.appData.mfsuBundleStatus,
                  }
                : {}),
            });
          }
          return next();
        }

        // static
        if (!process.env.DEVTOOL_LOCAL && path.startsWith('/__umi/')) {
          const shortPath = path.replace('/__umi/', '');
          if (shortPath !== '' && existsSync(join(devToolAppDist, shortPath))) {
            return res.sendFile(join(devToolAppDist, shortPath));
          } else {
            return res.sendFile(join(devToolAppDist, 'index.html'));
          }
        }

        // bundle status
        const isDone =
          api.appData.bundleStatus.done &&
          (enableVite ||
            api.config.mfsu === false ||
            api.appData.mfsuBundleStatus.done);

        if (!isDone) {
          res.setHeader('Content-Type', 'text/html');
          res.send(loadingHtml);
          return;
        }

        return next();
      },
    ];
  });
};
