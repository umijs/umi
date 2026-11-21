/** @jest-environment jsdom */

import { createBrowserHistory } from 'history';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Link, Outlet } from 'react-router-dom';
import { useClientLoaderData, useServerLoaderData } from './appContext';
import { renderClient } from './browser';
import type { ClientLoader } from './types';

const globals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const previousActEnvironment = globals.IS_REACT_ACT_ENVIRONMENT;
const previousFetch = globals.fetch;
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  window.history.replaceState(null, '', '/');
  window.__UMI_LOADER_DATA__ = undefined;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await React.act(async () => root.unmount());
  container.remove();
  globals.fetch = previousFetch;
  globals.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  window.__UMI_LOADER_DATA__ = undefined;
  window.history.replaceState(null, '', '/');
});

const independentLoader: ClientLoader = async () => ({
  title: 'Independent client data',
});

test.each([
  {
    name: 'SSR data',
    serverData: { home: { title: 'Initial home' } },
    clientLoader: undefined,
  },
  { name: 'empty SSR data', serverData: {}, clientLoader: undefined },
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
    if (reportLoader && serverData) reportLoader.hydrate = true;

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

    await React.act(async () => root.render(React.createElement(Browser)));
    expect(container.textContent).toBe(
      serverData ? serverData.home?.title ?? '' : 'Fetched home',
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
        'report:/report?quarter=2',
        'report:/report?quarter=3',
      ]);
      expect(container.querySelector('h1')?.dataset.serverTitle).toBe(
        'Quarterly report',
      );
    }
  },
);

test('publishes fallback server data after all matching loaders complete', async () => {
  window.history.replaceState(null, '', '/child');
  const pending = new Map<string, (data: Record<string, string>) => void>();
  globals.fetch = jest.fn(async (input: string) => {
    const id = new URL(input, window.location.origin).searchParams.get(
      'route',
    )!;
    const data = new Promise<Record<string, string>>((resolve) => {
      pending.set(id, resolve);
    });
    return { json: () => data } as Response;
  });

  function Child() {
    const { data } =
      useServerLoaderData<() => { parent: string; child: string }>();
    return React.createElement(
      'div',
      {},
      data ? JSON.stringify(data) : 'Loading',
    );
  }

  const Browser = renderClient({
    history: createBrowserHistory(),
    routes: {
      parent: { id: 'parent', path: '/', hasServerLoader: true },
      child: {
        id: 'child',
        parentId: 'parent',
        path: 'child',
        hasServerLoader: true,
      },
    },
    routeComponents: { parent: Outlet, child: Child },
    pluginManager: { applyPlugins: ({ initialValue }: any) => initialValue },
    components: true,
    __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {},
  })!;
  await React.act(async () => root.render(React.createElement(Browser)));
  expect([...pending.keys()]).toEqual(['parent', 'child']);
  expect(container.textContent).toBe('Loading');

  await React.act(async () => pending.get('child')!({ child: 'report' }));
  const afterChild = container.textContent;
  await React.act(async () => pending.get('parent')!({ parent: 'user' }));

  expect(afterChild).toBe('Loading');
  expect(JSON.parse(container.textContent!)).toEqual({
    parent: 'user',
    child: 'report',
  });
});

test.each([
  {
    name: 'SSR navigation with hydration enabled',
    ssr: true,
    hydrate: true,
    before: [],
    after: ['zh'],
  },
  {
    name: 'SSR navigation with hydration disabled',
    ssr: true,
    hydrate: false,
    before: [],
    after: [],
  },
  {
    name: 'CSR fallback',
    ssr: false,
    hydrate: false,
    before: ['en'],
    after: ['en', 'zh'],
  },
])(
  'preserves dual loader requests during $name',
  async ({ ssr, hydrate, before, after }) => {
    if (ssr) {
      window.__UMI_LOADER_DATA__ = { home: { title: 'SSR home' } };
    } else {
      window.history.replaceState(null, '', '/report');
    }

    const locales: string[] = [];
    globals.fetch = jest.fn(async (input: string) => {
      locales.push(
        new URL(input, window.location.origin).searchParams.get('locale')!,
      );
      return { json: async () => ({ title: 'Report' }) } as Response;
    });
    const history = createBrowserHistory();
    let resumePreparation!: () => void;
    const preparation = new Promise<void>((resolve) => {
      resumePreparation = resolve;
    });
    let locale = 'en';
    const clientLoader = jest.fn(
      async ({ serverLoader }: Parameters<ClientLoader>[0]) => {
        await preparation;
        locale = 'zh';
        await serverLoader();
      },
    ) as jest.MockedFunction<ClientLoader>;
    clientLoader.hydrate = hydrate;

    const Browser = renderClient({
      history,
      routes: {
        home: { id: 'home', path: '/', hasServerLoader: true },
        report: {
          id: 'report',
          path: '/report',
          hasServerLoader: true,
          clientLoader,
        },
      },
      routeComponents: { home: () => 'Home', report: () => 'Report' },
      pluginManager: {
        applyPlugins: ({ key, initialValue }: any) => {
          if (key !== 'modifyServerLoaderRequest') return initialValue;
          const url = new URL(initialValue.url, window.location.origin);
          url.searchParams.set('locale', locale);
          return { ...initialValue, url: url.href };
        },
      },
      components: true,
      __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {},
    })!;

    await React.act(async () => root.render(React.createElement(Browser)));
    if (ssr) await React.act(async () => history.push('/report'));
    const requestsBeforePreparation = [...locales];
    await React.act(async () => resumePreparation());

    expect(requestsBeforePreparation).toEqual(before);
    expect(clientLoader).toHaveBeenCalledTimes(hydrate || !ssr ? 1 : 0);
    expect(locales).toEqual(after);
  },
);
