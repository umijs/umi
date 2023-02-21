{{#isClientLoaderEnabled}}
import clientLoaders from './loaders.js';
{{/isClientLoaderEnabled}}
{{#isRoutePropsEnabled}}
import routeProps from './routeProps.js';
{{/isRoutePropsEnabled}}
{{#isReact}}
import React from 'react';
{{/isReact}}

export async function getRoutes() {
  const routes = {{{ routes }}} as const;
  return {
    routes,
    routeComponents: {{{ routeComponents }}},
  };
}
