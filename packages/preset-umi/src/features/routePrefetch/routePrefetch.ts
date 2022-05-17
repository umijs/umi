import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
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
      join(api.paths.absOutputPath, 'asset-manifest.json'),
      'utf-8',
    );
    const manifestObj = JSON.parse(manifest);
    const umiJsFileKey = Object.keys(manifestObj).find((key) =>
      key.startsWith('umi.'),
    );
    if (!umiJsFileKey) {
      throw new Error('Cannot find umi.js in manifest.json');
    }

    const umiJsFileName = manifestObj[umiJsFileKey];
    const umiJsFile = readFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      'utf-8',
    );

    // TODO: source map will break if we append to the beginning of the file, use https://github.com/Rich-Harris/magic-string to fix this
    const appendJs = `window.__umi_manifest__ = ` + manifest + ';';
    writeFileSync(
      join(api.paths.absOutputPath, umiJsFileName),
      appendJs + umiJsFile,
    );
  });
};
