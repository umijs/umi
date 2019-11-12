import { existsSync } from 'fs';
import { basename, join } from 'path';
import { resolve, parse } from 'url';
import { winPath } from 'umi-utils';

export const PWACOMPAT_PATH = 'pwacompat.min.js';
export const DEFAULT_MANIFEST_FILENAME = 'manifest.json';

export function prependPublicPath(publicPath = '/', src) {
  return resolve(publicPath, src);
}

export default function generateWebManifest(api, options) {
  const {
    config: { publicPath },
    log,
    paths: { absSrcPath },
    addHTMLLink,
    addHTMLHeadScript,
    addPageWatcher,
    onGenerateFiles,
  } = api;

  const defaultWebManifestOptions = {
    srcPath: join(winPath(absSrcPath), DEFAULT_MANIFEST_FILENAME),
  };
  let { srcPath } = {
    ...defaultWebManifestOptions,
    ...options,
  };

  let manifestFilename = basename(srcPath);

  const urlObj = parse(srcPath);
  // remove search
  srcPath = srcPath.replace(urlObj.search, '');

  if (existsSync(srcPath)) {
    // watch manifest on DEV mode
    if (process.env.NODE_ENV === 'development') {
      addPageWatcher([srcPath]);
    }
  } else {
    onGenerateFiles(() => {
      log.warn(`You'd better provide a WebManifest. Try to:
                1. Create one under: \`${srcPath}\`,
                2. Or override its path with \`pwa.manifestOptions.srcPath\` in umi config`);
    });
    srcPath = null;
    manifestFilename = DEFAULT_MANIFEST_FILENAME;
  }

  // add <link rel="manifest">
  addHTMLLink({
    rel: 'manifest',
    href: prependPublicPath(publicPath, manifestFilename),
  });

  // use PWACompat(https://github.com/GoogleChromeLabs/pwacompat) for non-compliant browsers
  addHTMLHeadScript({
    async: '',
    src: prependPublicPath(publicPath, PWACOMPAT_PATH),
  });

  return {
    srcPath,
    outputPath: manifestFilename,
  };
}
