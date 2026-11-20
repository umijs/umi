/** @jest-environment jsdom */
import { createMemoryHistory } from 'history';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  unstable_HistoryRouter as HistoryRouter,
  useRoutes,
} from 'react-router-dom';
import { AppContext } from './appContext';
import { createClientRoutes } from './routes';

test('createClientRoutes', () => {
  const clientRoutes = createClientRoutes({
    routesById: {
      a: { path: '/', id: 'a' },
      b: { path: '/b', id: 'b', parentId: 'a' },
    },
    routeComponents: {
      a: 'component-a',
      b: 'component-b',
    },
  });
  expect(clientRoutes[0].children![0].id).toEqual('b');
});

test.each([
  {
    label: 'a destination with its own query',
    redirect: '/items/:id?sort=date',
    from: '/old/7?page=2#results',
    expected: {
      pathname: '/items/7',
      search: '?sort=date&page=2',
      hash: '#results',
    },
    keepQuery: true,
  },
  {
    label: 'encoded and repeated values with a destination hash',
    redirect: '/items/:id?filter=red%20apple&tag=target#target',
    from: '/old/7?tag=first&tag=second#results',
    expected: {
      pathname: '/items/7',
      search: '?filter=red%20apple&tag=target&tag=first&tag=second',
      hash: '#target',
    },
    keepQuery: true,
  },
  {
    label: 'keepQuery disabled',
    redirect: '/items/:id?sort=date#target',
    from: '/old/7?page=2#results',
    expected: { pathname: '/items/7', search: '?sort=date', hash: '#target' },
    keepQuery: false,
  },
])('redirects with $label', ({ redirect, from, expected, keepQuery }) => {
  const routes = {
    old: { path: '/old/:id', id: 'old', redirect, keepQuery },
    items: { path: '/items/:id', id: 'items' },
  };
  const routeComponents = { items: () => null };
  const clientRoutes = createClientRoutes({
    routesById: routes,
    routeComponents,
  });
  const history = createMemoryHistory({ initialEntries: [from] });
  const root = createRoot(document.createElement('div'));
  const appData = {
    routes,
    routeComponents,
    clientRoutes,
    pluginManager: null,
    clientLoaderData: {},
    serverLoaderData: {},
  };

  function AppRoutes() {
    return useRoutes(clientRoutes);
  }

  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    act(() =>
      root.render(
        React.createElement(
          AppContext.Provider,
          { value: appData },
          React.createElement(
            HistoryRouter,
            { history },
            React.createElement(AppRoutes),
          ),
        ),
      ),
    );
    expect(history.location).toMatchObject(expected);
  } finally {
    act(() => root.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
