{{#isClientLoaderEnabled}}
import clientLoaders from './loaders.js';
{{/isClientLoaderEnabled}}
import React from 'react';

export async function getRoutes() {
  return {
    routes: {{{ routes }}},
    routeComponents: {{{ routeComponents }}},
  };
}
