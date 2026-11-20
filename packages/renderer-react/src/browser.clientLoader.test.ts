/** @jest-environment jsdom */

import { createMemoryHistory } from 'history';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useClientLoaderData } from './appContext';
import { renderClient } from './browser';

test('keeps the latest loader result for the same route ID', async () => {
  window.history.replaceState(null, '', '/orders/1');
  const history = createMemoryHistory({ initialEntries: ['/orders/1'] });
  const pending = new Map<string, (value: string) => void>();
  const clientLoader = () =>
    new Promise<string>((resolve) => {
      pending.set(history.location.pathname, resolve);
    });

  function Order() {
    const { data } = useClientLoaderData();
    return React.createElement('span', {}, data ?? 'loading');
  }

  const Browser = renderClient({
    history,
    routes: { order: { id: 'order', path: '/orders/:id', clientLoader } },
    routeComponents: { order: Order },
    pluginManager: { applyPlugins: ({ initialValue }: any) => initialValue },
    components: true,
    __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {},
  })!;
  const container = document.createElement('div');
  const root = createRoot(container);
  const globals = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };
  const previousActEnvironment = globals.IS_REACT_ACT_ENVIRONMENT;
  globals.IS_REACT_ACT_ENVIRONMENT = true;

  try {
    await React.act(async () => root.render(React.createElement(Browser)));
    await React.act(async () => history.push('/orders/2'));
    await React.act(async () => pending.get('/orders/2')!('order 2'));
    expect(container.textContent).toBe('order 2');

    await React.act(async () => pending.get('/orders/1')!('order 1'));
    expect(container.textContent).toBe('order 2');
  } finally {
    await React.act(async () => root.unmount());
    globals.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    window.history.replaceState(null, '', '/');
  }
});
