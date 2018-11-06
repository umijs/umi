import { readFileSync } from 'fs';
import { join } from 'path';
import { prependPublicPath, PWACOMPAT_PATH } from './generateWebManifest';

export default class WebManifestPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { publicPath, srcPath, outputPath, pkgName } = this.options;
    // our default manifest
    let rawManifest = {
      name: pkgName,
      short_name: pkgName,
      display: 'fullscreen',
      scope: '/',
      start_url: './?homescreen=true',
      orientation: 'portrait',
    };

    compiler.hooks.emit.tap('generate-webmanifest', compilation => {
      if (srcPath) {
        try {
          rawManifest = JSON.parse(readFileSync(srcPath, 'utf8'));
        } catch (e) {
          compilation.errors.push(
            new Error(
              `Please check ${srcPath}, a WebManifest should be a valid JSON file.`,
            ),
          );
          return;
        }
      }

      rawManifest.icons &&
        rawManifest.icons.forEach(icon => {
          icon.src = prependPublicPath(publicPath, icon.src);
        });

      // write manifest & pwacompat.js to filesystem
      [
        {
          path: outputPath,
          content: JSON.stringify(rawManifest),
        },
        {
          path: PWACOMPAT_PATH,
          content: readFileSync(join(__dirname, PWACOMPAT_PATH)),
        },
      ].forEach(({ path, content }) => {
        compilation.assets[path] = {
          source: () => content,
          size: () => content.length,
        };
      });
    });
  }
}
