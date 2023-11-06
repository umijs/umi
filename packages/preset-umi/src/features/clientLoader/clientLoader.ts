import type { IApi } from '../../types';
import { setupRouteExportExtractor } from '../../utils/routeExportExtractor';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  const entryFile = 'core/loaders.ts';
  const outFile = 'core/loaders.js';

  setupRouteExportExtractor({
    api,
    entryFile,
    outFile,
    propertyName: 'clientLoader',
  });
};
