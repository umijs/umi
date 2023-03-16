import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheck(() => {
    if (!api.config.manifest) {
      throw new Error('You must enable manifest to use routePrefetch feature!');
    }
  });

  api.onBuildComplete(() => {
    const manifest = readFileSync(
      join(
        api.paths.absOutputPath,
        api.config.manifest.fileName || 'asset-manifest.json',
      ),
      'utf-8',
    );
    const manifestObj = JSON.parse(manifest);
    const umiJsFileKey = Object.keys(manifestObj).find((key) =>
      key.match(/^umi(.*)\.js$/),
    );
    if (!umiJsFileKey) {
      throw new Error('Cannot find umi.js in manifest.json');
    }

    // manifest has publicPath, but we don't need it in the absOutputPath
    const umiJsFileName = manifestObj[umiJsFileKey].replace(
      new RegExp('^' + api.config.publicPath),
      '',
    );
    const umiJsFile = readFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      'utf-8',
    );

    // TODO: source map will break if we append to the beginning of the file, use https://github.com/Rich-Harris/magic-string to fix this
    const prependJS = `window.__umi_manifest__ = ` + manifest + ';';
    writeFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      prependJS + umiJsFile,
    );
  });
};
