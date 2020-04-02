import React from 'react';
import { MemoryRouter, Plugin } from '@umijs/runtime';
import { getByText, render, screen, wait } from '@testing-library/react';
import renderRoutes from './renderRoutes';
import { IRoute } from '..';

function TestInitialProps({ foo }: { foo: string }) {
  return <h1 data-testid="test">{foo}</h1>;
}

TestInitialProps.getInitialProps = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        foo: 'bar',
      });
    }, 100);
  });
};

function TestInitialPropsParent({
  foo,
  children,
}: {
  foo: string;
  children: any;
}) {
  return (
    <>
      <h1 data-testid="test-parent">{foo}</h1>
      {children}
    </>
  );
}

TestInitialPropsParent.getInitialProps = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        foo: 'parent',
      });
    }, 100);
  });
};

const routes = renderRoutes({
  routes: [
    {
      path: '/layout',
      component: (props) => (
        <>
          <h1 data-testid="layout">Layout</h1>
          {props.children}
        </>
      ),
      routes: [
        { path: '/layout', component: () => <h1 data-testid="test">Foo</h1> },
      ],
    },
    {
      path: '/layout-without-component',
      routes: [
        {
          path: '/layout-without-component/foo',
          component: () => <h1 data-testid="test">Foo</h1>,
        },
      ],
    },
    {
      path: '/users/:id',
      component: (props) => {
        return <h1 data-testid="test">{(props as any).match.params.id}</h1>;
      },
    },
    { path: '/bar', component: () => <h1 data-testid="test">Bar</h1> },
    {
      path: '/bar-exact',
      exact: true,
      component: () => <h1 data-testid="test">Bar Exact</h1>,
    },
    {
      path: '/bar-strict/',
      strict: true,
      component: () => <h1 data-testid="test">Bar Strict</h1>,
    },
    {
      path: '/bar-sensitive',
      sensitive: true,
      component: () => <h1 data-testid="test">Bar Sensitive</h1>,
    },
    { path: '/redirect', redirect: '/d' },
    { path: '/d', component: () => <h1 data-testid="test">Redirect</h1> },
    { path: '/get-initial-props', component: TestInitialProps as any },
    {
      path: '/get-initial-props-embed',
      component: TestInitialPropsParent as any,
      routes: [
        {
          path: '/get-initial-props-embed',
          component: TestInitialProps as any,
        },
      ],
    },
    {
      path: '/props-route',
      foo: 'bar',
      component: (props) => (
        <h1 data-testid="test">{`${(props as any).route.path} ${
          (props as any).route.foo
        }`}</h1>
      ),
    } as IRoute,
    {
      path: '/pass-props',
      component: (props: any) => {
        return React.Children.map(props.children, (child) => {
          return React.cloneElement(child, { foo: 'bar' });
        });
      },
      routes: [
        {
          path: '/pass-props',
          component: (props: any) => <h1 data-testid="test">{props.foo}</h1>,
        },
      ],
    },
    {
      path: '/wrappers',
      component: () => <h1>foo</h1>,
      wrappers: [
        (props: any) => (
          <>
            <h1>wrapper 1 {props.route.path}</h1>
            {props.children}
          </>
        ),
        (props: any) => (
          <>
            <h1>wrapper 2</h1>
            {props.children}
          </>
        ),
      ],
    },
    { component: () => <h1 data-testid="test">Fallback</h1> },
  ],
  plugin: new Plugin(),
});

test('/layout', async () => {
  render(<MemoryRouter initialEntries={['/layout']}>{routes}</MemoryRouter>);
  expect((await screen.findByTestId('layout')).innerHTML).toEqual('Layout');
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Foo');
});

test('/layout-without-component', async () => {
  render(
    <MemoryRouter initialEntries={['/layout-without-component/foo']}>
      {routes}
    </MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Foo');
});

test('/bar', async () => {
  render(<MemoryRouter initialEntries={['/bar']}>{routes}</MemoryRouter>);
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Bar');
});

test('/BAR', async () => {
  render(<MemoryRouter initialEntries={['/BAR']}>{routes}</MemoryRouter>);
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Bar');
});

test('/bar-exact/foo', async () => {
  render(
    <MemoryRouter initialEntries={['/bar-exact/foo']}>{routes}</MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Fallback');
});

test('/bar-strict', async () => {
  render(
    <MemoryRouter initialEntries={['/bar-strict']}>{routes}</MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Fallback');
});

test('/BAR-sensitive', async () => {
  render(
    <MemoryRouter initialEntries={['/BAR-sensitive']}>{routes}</MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Fallback');
});

test('/users/123', async () => {
  render(<MemoryRouter initialEntries={['/users/123']}>{routes}</MemoryRouter>);
  expect((await screen.findByTestId('test')).innerHTML).toEqual('123');
});

test('/redirect', async () => {
  render(<MemoryRouter initialEntries={['/redirect']}>{routes}</MemoryRouter>);
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Redirect');
});

test('/props-route', async () => {
  render(
    <MemoryRouter initialEntries={['/props-route']}>{routes}</MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual(
    '/props-route bar',
  );
});

test('/pass-props', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/pass-props']}>{routes}</MemoryRouter>,
  );
  await wait(() => getByText(container, 'bar'));
  expect((await screen.findByTestId('test')).innerHTML).toEqual('bar');
});

test('/get-initial-props', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/get-initial-props']}>
      {routes}
    </MemoryRouter>,
  );
  await wait(() => getByText(container, 'bar'));
  expect((await screen.findByTestId('test')).innerHTML).toEqual('bar');
});

test('/get-initial-props-embed', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/get-initial-props-embed']}>
      {routes}
    </MemoryRouter>,
  );
  await wait(() => getByText(container, 'bar'));
  await wait(() => getByText(container, 'parent'));
  expect((await screen.findByTestId('test')).innerHTML).toEqual('bar');
  expect((await screen.findByTestId('test-parent')).innerHTML).toEqual(
    'parent',
  );
});

test('/wrappers', async () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/wrappers']}>{routes}</MemoryRouter>,
  );
  expect(container.innerHTML).toEqual(
    '<h1>wrapper 1 /wrappers</h1><h1>wrapper 2</h1><h1>foo</h1>',
  );
});

test('/fallback-20140924', async () => {
  render(
    <MemoryRouter initialEntries={['/fallback-20140924']}>
      {routes}
    </MemoryRouter>,
  );
  expect((await screen.findByTestId('test')).innerHTML).toEqual('Fallback');
});
