{{#isClientLoaderEnabled}}
import clientLoaders from './loaders.js';
{{/isClientLoaderEnabled}}
{{#isReact}}
import React from 'react';
{{/isReact}}

export async function getRoutes() {
  return {
    routes: {{{ routes }}},
    routeComponents: {{{ routeComponents }}},
  };
}
