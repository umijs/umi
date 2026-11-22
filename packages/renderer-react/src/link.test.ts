/** @jest-environment jsdom */

import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from './appContext';
import { LinkWithPrefetch } from './link';

test.each([
  [{ search: '?tab=mine' }, '/orders?tab=mine'],
  [{ hash: '#items' }, '/orders#items'],
] as const)('renders a link to the current page with %j', (to, href) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  const preloadRoute = jest.fn();
  const app = {
    routes: {},
    routeComponents: {},
    clientRoutes: [],
    pluginManager: {},
    clientLoaderData: {},
    serverLoaderData: {},
    preloadRoute,
  };
  try {
    flushSync(() => {
      root.render(
        React.createElement(
          AppContext.Provider,
          { value: app },
          React.createElement(
            MemoryRouter,
            { initialEntries: ['/orders'] },
            React.createElement(
              LinkWithPrefetch,
              { to, prefetch: 'render' },
              'Orders',
            ),
          ),
        ),
      );
    });
    expect(container.querySelector('a')?.getAttribute('href')).toBe(href);
    expect(preloadRoute).not.toHaveBeenCalled();
  } finally {
    root.unmount();
  }
});
