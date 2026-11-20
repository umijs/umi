import type { RequestHandler } from '@umijs/bundler-webpack';
import { cheerio } from '@umijs/utils';
import { readFileSync, realpathSync } from 'fs';
import { isAbsolute, join, relative, sep } from 'path';
import { IApi } from '../../types';
import { getDiagnosticAppData, getDiagnosticConfig } from './diagnostics';

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
      ((req, res, next) => {
        const { path } = req;

        const enableVite = api.appData.vite;

        // api
        if (path.startsWith('/__umi/api/')) {
          const shortPath = path.replace('/__umi/api/', '');
          if (shortPath === 'config') {
            return res.json(getDiagnosticConfig(api.config));
          }
          if (shortPath === 'app-data') {
            return res.json(getDiagnosticAppData(api));
          }
          if (shortPath === 'bundle-status') {
            const isMFSUEnable = api.config.mfsu !== false;

            return res.json({
              bundler: api.appData.bundler,
              bundleStatus: api.appData.bundleStatus,
              ...(isMFSUEnable && !enableVite
                ? {
                    mfsuBundleStatus: api.appData.mfsuBundleStatus,
                  }
                : {}),
            });
          }
          // for probe dev server status
          if (shortPath === 'status') {
            const isBundleDone = api.appData.bundleStatus?.done;

            // vite
            if (enableVite && isBundleDone) {
              return res.end();
            }

            // mfsu
            const isMFSUDone = api.config.mfsu
              ? api.appData.mfsuBundleStatus?.done
              : true;

            if (isMFSUDone && isBundleDone) {
              return res.end();
            }

            return res.status(400).end();
          }

          return next();
        }

        // static
        if (!process.env.DEVTOOL_LOCAL && path.startsWith('/__umi/')) {
          const shortPath = path.replace('/__umi/', '');
          const file = resolveDevToolFile(devToolAppDist, shortPath);
          if (file === null) {
            return res.status(403).end();
          }
          if (!file) {
            return res.status(404).end();
          }
          return res.sendFile(file.path, { root: file.root });
        }

        if (
          req.headers.accept?.includes('text/html') ||
          req.headers.accept === '*/*'
        ) {
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
        }

        return next();
      }) as RequestHandler,
    ];
  });
};

function isOutsideRoot(relativePath: string) {
  return (
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  );
}

function realpathIfPresent(file: string) {
  try {
    return realpathSync(file);
  } catch (err) {
    const { code } = err as NodeJS.ErrnoException;
    if (code !== 'ENOENT' && code !== 'ENOTDIR') {
      throw err;
    }
  }
}

export function resolveDevToolFile(root: string, file: string) {
  const requestedPath = relative(root, join(root, file || 'index.html'));
  if (isOutsideRoot(requestedPath)) {
    return null;
  }

  const realRoot = realpathIfPresent(root);
  if (!realRoot) {
    return;
  }
  const realFile =
    realpathIfPresent(join(realRoot, requestedPath)) ??
    realpathIfPresent(join(realRoot, 'index.html'));
  if (!realFile) {
    return;
  }

  // Serve the validated canonical path instead of following the request path
  // again after validating it.
  const realRelativePath = relative(realRoot, realFile);
  if (isOutsideRoot(realRelativePath)) {
    return null;
  }
  return { path: realRelativePath || '.', root: realRoot };
}
