import type { IApi } from '../../types';
import {
  generateRouteExportTmpFile,
  setupExportExtractBuilder,
} from '../../utils/routeExportExtractor';

export const ROUTE_PROPS_PROPERTY = 'routeProps';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  const entryFile = 'core/routeProps.ts';
  const outFile = 'core/routeProps.js';

  api.onGenerateFiles(() => {
    generateRouteExportTmpFile({
      api,
      propertyName: ROUTE_PROPS_PROPERTY,
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
