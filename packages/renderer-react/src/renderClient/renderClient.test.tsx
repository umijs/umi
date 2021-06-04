import { cleanup, getByText, render, waitFor } from '@testing-library/react';
import { createMemoryHistory, dynamic, Plugin } from '@umijs/runtime';
import React from 'react';
import { act } from 'react-dom/test-utils';
import renderClient, { preloadComponent } from './renderClient';

let container: any;

beforeEach(() => {
  container = document.createElement('div');
  container.id = 'app';
  document.body.appendChild(container);
  window.g_useSSR = true;
  window.g_initialProps = null;
});

afterEach(async () => {
  document.body.removeChild(container);
  container = null;
  delete window.g_useSSR;
  delete window.g_initialProps;
  await cleanup();
});

test('normal', async () => {
  const history = createMemoryHistory({
    initialEntries: ['/foo'],
  });
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any, args: any) {
        if (!(args.history && args.plugin && args.routes)) {
          throw new Error(
            'history, plugin or routes not exists in the args of rootContainer',
          );
        }
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });
  const { container } = render(
    renderClient({
      history,
      plugin,
      rootElement: undefined,
      routes: [
        { path: '/foo', component: () => <h1>foo</h1> },
        { path: '/bar', component: () => <h1>bar</h1> },
      ],
    }),
  );
  expect(container.innerHTML).toEqual('<div><h1>foo</h1></div>');

  history.push({
    pathname: '/bar',
  });
  expect(container.innerHTML).toEqual('<div><h1>bar</h1></div>');
  expect(routeChanges).toEqual(['POP /foo', 'PUSH /bar']);
});

test('normal with mount', async () => {
  const history = createMemoryHistory({
    initialEntries: ['/foo'],
  });
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any, args: any) {
        if (!(args.history && args.plugin && args.routes)) {
          throw new Error(
            'history, plugin or routes not exists in the args of rootContainer',
          );
        }
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });
  let loading = true;
  act(() => {
    renderClient({
      history,
      plugin,
      // #app
      rootElement: 'app',
      routes: [
        { path: '/foo', component: () => <h1>foo</h1> },
        { path: '/bar', component: () => <h1>bar</h1> },
      ],
      callback: () => {
        loading = false;
      },
    });
  });
  expect(container.outerHTML).toEqual(
    '<div id="app"><div><h1>foo</h1></div></div>',
  );
  expect(loading).toBeFalsy();

  history.push({
    pathname: '/bar',
  });
  expect(container.innerHTML).toEqual('<div><h1>bar</h1></div>');
  expect(routeChanges).toEqual(['POP /foo', 'PUSH /bar']);
});

const Common: React.FC<{ title: string }> & {
  getInitialProps: (props: any) => any;
} = ({ title }) => {
  return <h1>{title}</h1>;
};

Common.getInitialProps = async ({ match }) => {
  return {
    title: match.path,
  };
};

test('preloadComponent', async () => {
  const history = createMemoryHistory({
    initialEntries: ['/foo'],
  });
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any, args: any) {
        if (!(args.history && args.plugin && args.routes)) {
          throw new Error(
            'history, plugin or routes not exists in the args of rootContainer',
          );
        }
        return container;
      },
    },
    path: '/foo',
  });

  const routes: any[] = [
    {
      path: '/',
      component: dynamic({
        loading: () => <div>loading</div>,
        loader: async () => (props: React.PropsWithChildren<{}>) => (
          <div className="layout">{props.children}</div>
        ),
      }),
      routes: [
        {
          path: '/foo',
          component: dynamic({
            loading: () => <div>loading</div>,
            loader: async () => Common,
          }),
        },
        {
          path: '/bar',
          component: dynamic({
            loading: () => <div>loading</div>,
            loader: async () => Common,
          }),
        },
      ],
    },
  ];
  // /foo
  const { container: originContainer } = render(
    renderClient({
      history,
      plugin,
      ssrProps: {},
      rootElement: undefined,
      routes,
    }),
  );
  expect(originContainer.innerHTML).toEqual('<div>loading</div>');

  await preloadComponent(routes, '/foo');
  const { container } = render(
    renderClient({
      history,
      plugin,
      rootElement: undefined,
      routes,
    }),
  );
  await waitFor(() => getByText(container, '/foo'));
  expect(container.innerHTML).toEqual(
    '<div class="layout"><h1>/foo</h1></div>',
  );
});

test('preloadComponent routeChange with ssr', async () => {
  // not support node 8
  const history = createMemoryHistory({
    initialEntries: ['/foo'],
  });
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any, args: any) {
        if (!(args.history && args.plugin && args.routes)) {
          throw new Error(
            'history, plugin or routes not exists in the args of rootContainer',
          );
        }
        return container;
      },
    },
    path: '/foo',
  });

  const routes: any[] = [
    {
      path: '/',
      component: dynamic({
        loading: () => <div>loading</div>,
        loader: async () => (props: React.PropsWithChildren<{}>) => (
          <div className="layout">{props.children}</div>
        ),
      }),
      routes: [
        {
          path: '/foo',
          component: dynamic({
            loading: () => <div>loading</div>,
            loader: async () => Common,
          }),
        },
        {
          path: '/bar',
          component: dynamic({
            loading: () => <div>loading</div>,
            loader: async () => Common,
          }),
        },
      ],
    },
  ];
  await preloadComponent(routes, '/foo');

  // history route change
  history.push({
    pathname: '/bar',
  });
  const { container } = render(
    renderClient({
      history,
      plugin,
      ssrProps: {},
      rootElement: undefined,
      routes,
    }),
  );
  expect(container.innerHTML).toEqual(
    '<div class="layout"><div>loading</div></div>',
  );
  await waitFor(() => getByText(container, '/bar'));
  expect(container.innerHTML).toEqual(
    '<div class="layout"><h1>/bar</h1></div>',
  );
});
