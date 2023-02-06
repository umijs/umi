{{#isClientLoaderEnabled}}
import clientLoaders from './loaders.js';
{{/isClientLoaderEnabled}}
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
