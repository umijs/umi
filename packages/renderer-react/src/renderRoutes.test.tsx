import React from 'react';
import { MemoryRouter, Plugin } from '@umijs/runtime';
import { render, screen } from '@testing-library/react';
import renderRoutes from './renderRoutes';

test('normal', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      {renderRoutes({
        routes: [
          { path: '/', component: () => <h1 data-testid="foo">Foo</h1> },
        ],
        plugin: new Plugin(),
      })}
    </MemoryRouter>,
  );
  expect((await screen.findByTestId('foo')).innerHTML).toEqual('Foo');
});
