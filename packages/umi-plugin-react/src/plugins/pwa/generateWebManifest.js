import { existsSync } from 'fs';
import { basename, join } from 'path';
import { resolve } from 'url';

const PWACOMPAT_URL =
  'https://cdn.jsdelivr.net/npm/pwacompat@2.0.7/pwacompat.min.js';
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
  } = api;

  const defaultWebManifestOptions = {
    srcPath: join(absSrcPath, DEFAULT_MANIFEST_FILENAME),
  };
  let { srcPath } = {
    ...defaultWebManifestOptions,
    ...options,
  };
  let manifestFilename = basename(srcPath);

  if (existsSync(srcPath)) {
    // watch manifest on DEV mode
    if (process.env.NODE_ENV === 'development') {
      addPageWatcher([srcPath]);
    }
  } else {
    log.warn(`You'd better provide a WebManifest. Try to:
              1. Create one under: \`${srcPath}\`,
              2. Or override its path with \`pwa.manifestOptions.srcPath\` in umi config`);
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
    src: PWACOMPAT_URL,
    crossorigin: 'anonymous',
  });

  return {
    srcPath,
    outputPath: manifestFilename,
  };
}
