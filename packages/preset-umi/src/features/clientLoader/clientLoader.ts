import type { IApi } from '../../types';
import {
  generateRouteExportTmpFile,
  setupExportExtractBuilder,
} from '../../utils/routeExportExtractor';

export const CLIENT_LOADER_PROPERTY = 'clientLoader';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  const entryFile = 'core/loaders.ts';
  const outFile = 'core/loaders.js';

  api.onGenerateFiles(() => {
    generateRouteExportTmpFile({
      api,
      propertyName: CLIENT_LOADER_PROPERTY,
      entryFile,
    });
  });

  api.onBeforeCompiler(() =>
    setupExportExtractBuilder({
      api,
      entryFile,
      outFile,
    }),
  );
};
