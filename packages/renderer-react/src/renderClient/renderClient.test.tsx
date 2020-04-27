import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { createMemoryHistory, Plugin, dynamic } from '@umijs/runtime';
import { delay } from '@umijs/utils';
import renderClient, { preloadComponent } from './renderClient';

afterEach(cleanup);

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
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });

  const routes: any[] = [
    {
      path: '/foo',
      component: dynamic({
        loading: () => <div>loading</div>,
        loader: async () => () => <h1>foo</h1>,
      }),
    },
    {
      path: '/bar',
      component: dynamic({
        loading: () => <div>loading</div>,
        loader: async () => () => <h1>bar</h1>,
      }),
    },
  ];

  const { container: originContainer } = render(
    renderClient({
      history,
      plugin,
      rootElement: undefined,
      routes,
    }),
  );

  expect(originContainer.innerHTML).toEqual('<div><div>loading</div></div>');

  const newRoutes = await preloadComponent(routes, '/bar');
  const { container } = render(
    renderClient({
      history,
      plugin,
      rootElement: undefined,
      routes: newRoutes,
    }),
  );
  expect(container.innerHTML).toEqual('<div><h1>foo</h1></div>');
});
