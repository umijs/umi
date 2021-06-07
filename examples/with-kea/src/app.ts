import React from 'react';
import { Provider, resetContext } from 'kea';
import { routerPlugin } from 'kea-router';
import { loadersPlugin } from 'kea-loaders';

export function rootContainer(container, opts) {
  resetContext({
    plugins: [routerPlugin, loadersPlugin],
  });
  return React.createElement(Provider, opts, container);
}
