import type { IApi } from '../../types';
import {
  generateRouteExportTmpFile,
  setupExportExtractBuilder,
} from '../../utils/routeExportExtractor';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    generateRouteExportTmpFile(api, 'routeProps', 'core/routeProps.ts');
  });

  api.onBeforeCompiler(() =>
    setupExportExtractBuilder(api, 'core/routeProps.ts', 'core/routeProps.js'),
  );
};
