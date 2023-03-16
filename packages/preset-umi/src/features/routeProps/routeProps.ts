import type { IApi } from '../../types';
import { setupRouteExportExtractor } from '../../utils/routeExportExtractor';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: () => {
      return !api.userConfig.routes;
    },
  });

  const entryFile = 'core/routeProps.ts';
  const outFile = 'core/routeProps.js';

  setupRouteExportExtractor({
    api,
    entryFile,
    outFile,
    propertyName: 'routeProps',
  });
};
