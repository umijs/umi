/** @jest-environment jsdom */

import { createBrowserHistory } from 'history';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from 'react-router-dom';
import { useClientLoaderData, useServerLoaderData } from './appContext';
import { renderClient } from './browser';
import type { ClientLoader } from './types';

const independentLoader: ClientLoader = async () => ({
  title: 'Independent client data',
});

test.each([
  {
    name: 'SSR data',
    serverData: { home: { title: 'Initial home' } },
    clientLoader: undefined,
  },
  { name: 'CSR fallback', serverData: undefined, clientLoader: undefined },
  {
    name: 'CSR fallback with independent loaders',
    serverData: undefined,
    clientLoader: independentLoader,
    clientTitle: 'Independent client data',
    homeClientLoader: independentLoader,
  },
  {
    name: 'SSR data, via a client loader',
    serverData: { home: { title: 'Initial home' } },
    clientLoader: (async ({ serverLoader }) => ({
      title: `${(await serverLoader()).title} via client loader`,
    })) satisfies ClientLoader,
    clientTitle: 'Quarterly report via client loader',
  },
])(
  'loads server data on navigation after $name',
  async ({ serverData, clientLoader, clientTitle, homeClientLoader }) => {
    const globals = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    };
    const previousActEnvironment = globals.IS_REACT_ACT_ENVIRONMENT;
    const previousFetch = globals.fetch;
    globals.IS_REACT_ACT_ENVIRONMENT = true;
    window.history.replaceState(null, '', '/');
    window.__UMI_LOADER_DATA__ = serverData;
    const history = createBrowserHistory();
    let resumeDelayed!: () => void;
    const delayed = new Promise<void>((resolve) => {
      resumeDelayed = resolve;
    });
    const reportLoader: ClientLoader | undefined =
      clientLoader &&
      (async (args) => {
        if (history.location.search === '?quarter=3') await delayed;
        return clientLoader(args);
      });

    const requests: string[] = [];
    globals.fetch = jest.fn(async (input: string) => {
      const { searchParams } = new URL(input, window.location.origin);
      const route = searchParams.get('route')!;
      const url = new URL(searchParams.get('url')!);
      const quarter = url.searchParams.get('quarter');
      requests.push(`${route}:${url.pathname}${url.search}`);
      return {
        json: async () => {
          if (quarter === '3') await delayed;
          return {
            title:
              route === 'home'
                ? 'Fetched home'
                : quarter === '3'
                ? 'Previous report'
                : 'Quarterly report',
          };
        },
      } as Response;
    });

    function Home() {
      const { data } = useServerLoaderData<() => { title: string }>();
      const clientData = useClientLoaderData().data;
      const linkProps = {
        to: '/report?quarter=4',
        'data-client-title': clientData?.title,
      };
      return React.createElement(Link, linkProps, data?.title);
    }

    function Report() {
      const { data } = useServerLoaderData<() => { title: string }>();
      const clientData = useClientLoaderData().data;
      return React.createElement(
        'h1',
        { 'data-server-title': data?.title },
        (clientLoader ? clientData?.title : data?.title) ?? 'Missing report',
      );
    }

    const Browser = renderClient({
      history,
      routes: {
        home: {
          id: 'home',
          path: '/',
          hasServerLoader: true,
          clientLoader: homeClientLoader,
        },
        report: {
          id: 'report',
          path: '/report',
          hasServerLoader: true,
          clientLoader: reportLoader,
        },
      },
      routeComponents: { home: Home, report: Report },
      pluginManager: { applyPlugins: ({ initialValue }: any) => initialValue },
      components: true,
      __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {},
    })!;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      await React.act(async () => root.render(React.createElement(Browser)));
      expect(container.textContent).toBe(
        serverData ? 'Initial home' : 'Fetched home',
      );
      expect(container.querySelector('a')?.dataset.clientTitle).toBe(
        homeClientLoader ? clientTitle : undefined,
      );
      expect(requests).toEqual(serverData ? [] : ['home:/']);

      await React.act(async () => {
        container
          .querySelector('a')!
          .dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true }),
          );
      });
      expect(container.textContent).toBe(clientTitle ?? 'Quarterly report');
      expect(container.querySelector('h1')?.dataset.serverTitle).toBe(
        'Quarterly report',
      );
      expect(requests).toEqual([
        ...(serverData ? [] : ['home:/']),
        'report:/report?quarter=4',
      ]);

      if (clientLoader && !homeClientLoader) {
        await React.act(async () => history.push('/report?quarter=3'));
        await React.act(async () => history.push('/report?quarter=2'));
        await React.act(async () => resumeDelayed());
        expect(requests).toEqual([
          'report:/report?quarter=4',
          'report:/report?quarter=3',
          'report:/report?quarter=2',
        ]);
        expect(container.querySelector('h1')?.dataset.serverTitle).toBe(
          'Quarterly report',
        );
      }
    } finally {
      await React.act(async () => root.unmount());
      container.remove();
      globals.fetch = previousFetch;
      globals.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
      window.__UMI_LOADER_DATA__ = undefined;
      window.history.replaceState(null, '', '/');
    }
  },
);
