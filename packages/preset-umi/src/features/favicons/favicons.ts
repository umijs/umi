import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

const FAVICON_FILES = [
  'favicon.ico',
  'favicon.gif',
  'favicon.png',
  'favicon.jpg',
  'favicon.jpeg',
  'favicon.svg',
  'favicon.avif',
  'favicon.webp',
];

function getFaviconFiles(p: string): string[] | undefined {
  return FAVICON_FILES.filter((f) => existsSync(join(p, f)));
}

export default (api: IApi) => {
  api.describe({
    config: {
      schema: ({ zod }) => zod.array(zod.string()),
    },
  });

  api.modifyAppData(async (memo) => {
    if (api.config.favicons) return memo;
    const faviconFiles = getFaviconFiles(api.paths.absSrcPath);
    if (faviconFiles) {
      memo.faviconFiles = faviconFiles;
    }
    return memo;
  });

  api.addBeforeMiddlewares(() => [
    (req, res, next) => {
      const iconFile = (api.appData.faviconFiles || []).find(
        (file: any) => req.path === `${api.config.publicPath}${file}`,
      );
      if (!iconFile) {
        next();
      } else {
        res.sendFile(join(api.paths.absSrcPath, iconFile));
      }
    },
  ]);

  api.onBuildComplete(({ err }) => {
    if (err) return;
    if (api.appData.faviconFiles) {
      api.appData.faviconFiles.forEach((e: any) => {
        copyFileSync(
          join(api.paths.absSrcPath, e),
          join(api.paths.absOutputPath, e),
        );
      });
    }
  });

  api.modifyHTMLFavicon((memo) => {
    // respect favicon config from user, and fallback to auto-detecting files
    if (!memo.length && api.appData.faviconFiles) {
      api.appData.faviconFiles.forEach((e: any) => {
        memo.push(`${api.config.publicPath}${e}`);
      });
    }
    return memo;
  });
};
