/** @jest-environment jsdom */

import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  HashRouter,
  MemoryRouter,
  useLocation,
} from 'react-router-dom';
import { AppContext } from './appContext';
import { LinkWithPrefetch } from './link';

function CurrentPath() {
  const { pathname, search, hash } = useLocation();
  return React.createElement('output', null, `${pathname}${search}${hash}`);
}

test.each([
  ['memory', '/orders', { search: '?tab=mine' }, '?tab=mine'],
  ['memory', '/orders', { hash: '#items' }, '#items'],
  ['memory', '//orders', { search: '?tab=mine' }, '?tab=mine'],
  ['browser', '//orders', { search: '?tab=mine' }, '?tab=mine'],
  ['browser', '//orders', { hash: '#items' }, '#items'],
  ['hash', '//orders', { hash: '#items' }, '#items'],
] as const)(
  'keeps %s history on %s for a link to %j',
  (type, pathname, to, suffix) => {
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
    const { href: originalHref, origin } = window.location;
    window.history.replaceState(
      null,
      '',
      type === 'hash' ? `/#${pathname}` : `/.${pathname}`,
    );

    try {
      const content = React.createElement(
        React.Fragment,
        null,
        React.createElement(
          LinkWithPrefetch,
          { to, prefetch: 'render' },
          'Orders',
        ),
        React.createElement(CurrentPath),
      );
      const router =
        type === 'memory'
          ? React.createElement(
              MemoryRouter,
              { initialEntries: [pathname] },
              content,
            )
          : React.createElement(
              type === 'hash' ? HashRouter : BrowserRouter,
              null,
              content,
            );
      flushSync(() => {
        root.render(
          React.createElement(AppContext.Provider, { value: app }, router),
        );
      });
      const link = container.querySelector('a')!;
      const href = new URL(link.href);
      expect(href.origin).toBe(origin);
      expect(
        type === 'hash'
          ? href.hash.slice(1)
          : `${href.pathname}${href.search}${href.hash}`,
      ).toBe(`${pathname}${suffix}`);
      flushSync(() => link.click());
      expect(container.querySelector('output')?.textContent).toBe(
        `${pathname}${suffix}`,
      );
      expect(preloadRoute).not.toHaveBeenCalled();
    } finally {
      root.unmount();
      window.history.replaceState(null, '', originalHref);
    }
  },
);
