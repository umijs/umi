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

  api.onGenerateFiles(() => {
    const routePropsImports: string[] = [];
    const routePropsDefines: string[] = [];
    const routeIds = Object.keys(api.appData.routes);
    let index = 0;
    for (const id of routeIds) {
      const route = api.appData.routes[id];
      if (route.routeProps) {
        index += 1;
        routePropsImports.push(
          `import { routeProps as routeProps_${index} } from '${route.__absFile}';`,
        );
        routePropsDefines.push(`  '${id}': routeProps_${index},`);
      }
    }
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/routeProps.ts',
      content: `
${routePropsImports.join('\n')}
export default {
${routePropsDefines.join('\n')}
};
      `,
    });
  });
};
