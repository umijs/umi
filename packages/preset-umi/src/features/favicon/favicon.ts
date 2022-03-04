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

function getFaviconFile(p: string): string | undefined {
  return FAVICON_FILES.find((f) => existsSync(join(p, f)));
}

export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.string(),
    },
  });

  api.modifyAppData(async (memo) => {
    if (api.config.favicon) return memo;
    const faviconFile = getFaviconFile(api.paths.absSrcPath);
    if (faviconFile) {
      memo.faviconFile = faviconFile;
    }
    return memo;
  });

  api.addBeforeMiddlewares(() => [
    (req, res, next) => {
      if (
        api.appData.faviconFile &&
        req.path === `/${api.appData.faviconFile}`
      ) {
        res.sendFile(join(api.paths.absSrcPath, api.appData.faviconFile));
      } else {
        next();
      }
    },
  ]);

  api.onBuildComplete(({ err }) => {
    if (err) return;
    if (api.appData.faviconFile) {
      copyFileSync(
        join(api.paths.absSrcPath, api.appData.faviconFile),
        join(api.paths.absOutputPath, api.appData.faviconFile),
      );
    }
  });

  api.modifyHTMLFavicon((memo) => {
    return api.appData.faviconFile
      ? `${api.config.publicPath}${api.appData.faviconFile}`
      : memo;
  });
};
