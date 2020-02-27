import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryHistory, Plugin } from '@umijs/runtime';
import { delay } from '@umijs/utils';
import renderClient from './renderClient';

test('normal', async () => {
  const history = createMemoryHistory({
    initialEntries: ['/foo'],
  });
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
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
  expect(container.getElementsByTagName('h1')[0].innerHTML).toEqual('foo');

  history.push({
    pathname: '/bar',
  });
  expect(container.getElementsByTagName('h1')[0].innerHTML).toEqual('bar');
  expect(routeChanges).toEqual(['POP /foo', 'PUSH /bar']);
});
