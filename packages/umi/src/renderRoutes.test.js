import React from 'react';
import TestRenderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import renderRoutes from './renderRoutes';

window.__UMI_BIGFISH_COMPAT = false;
window.__IS_BROWSER = true;

beforeEach(() => {
  jest.mock('umi/_runtimePlugin', () => ({
    apply(key, { initialValue }) {
      return initialValue;
    },
  }));
});

afterEach(() => {
  jest.unmock('umi/_runtimePlugin');
});

function Layout({ children }) {
  return (
    <React.Fragment>
      <h1>Layout</h1>
      {children}
    </React.Fragment>
  );
}

function IndexPage({ location: { pathname } }) {
  return (
    <React.Fragment>
      <h1>Index Page</h1>
      {pathname}
    </React.Fragment>
  );
}

function UsersPage({ match }) {
  return (
    <React.Fragment>
      <h1>Users Page</h1>
      {match.params.userId}
    </React.Fragment>
  );
}

function BigfishParams({ params }) {
  return (
    <React.Fragment>
      <h1>BigfishParams Page</h1>
      {params.userId}
    </React.Fragment>
  );
}

function Redirect() {
  return <h1>Redirect Page</h1>;
}

function NeedLogin({ children }) {
  return (
    <React.Fragment>
      <h1>Need Login</h1>
      {children}
    </React.Fragment>
  );
}

function NeedConfirm({ children }) {
  return (
    <React.Fragment>
      <h1>Need Confirm</h1>
      {children}
    </React.Fragment>
  );
}

function Route() {
  return <h1>Route</h1>;
}

function PassPropsLayout({ children }) {
  return React.Children.map(children, child => {
    return React.cloneElement(
      child,
      null,
      React.Children.map(child.props.children, child => {
        return React.cloneElement(child, { test: 'test' });
      }),
    );
  });
}

function PassPropsRouteComponent({ test }) {
  return <h1>PassPropsRouteComponent: {test || 'null'}</h1>;
}

function Fallback() {
  return <h1>Fallback</h1>;
}

function BigfishRoute({ children, params }) {
  return (
    <React.Fragment>
      <h1>BigfishRoute: {params.userId}</h1>
      {children}
    </React.Fragment>
  );
}

function ShowFoo({ foo }) {
  return <h1>foo: {foo || 'null'}</h1>;
}

function GetInitialProps({ foo }) {
  return <h1>{foo}</h1>;
}

GetInitialProps.getInitialProps = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        foo: 'bar',
      });
    }, 500);
  });
};

const routes = [
  {
    path: '/',
    exact: true,
    component: Layout,
    routes: [{ path: '/', exact: true, component: IndexPage }],
  },
  { path: '/users/:userId', exact: true, component: UsersPage },
  { path: '/bigfishParams/:userId', exact: true, component: BigfishParams },
  {
    path: '/bigfishParamsWithRoutes/:userId',
    Routes: [BigfishRoute],
    exact: true,
    component: BigfishParams,
  },
  { path: '/redirect', redirect: '/d' },
  { path: '/d', component: Redirect },
  { path: '/test-Routes', Routes: [NeedLogin], component: Route },
  {
    path: '/test-Routes-multiple',
    Routes: [NeedLogin, NeedConfirm],
    component: Route,
  },
  {
    path: '/pass-props-from-layout',
    component: PassPropsLayout,
    routes: [{ path: '/pass-props-from-layout', component: PassPropsRouteComponent }],
  },
  { path: '/g_plugins', component: ShowFoo },
  { path: '/get-initial-props', component: GetInitialProps },
  {
    path: '/layout-no-component',
    routes: [{ path: '/layout-no-component/foo', component: IndexPage }],
  },
  { component: Fallback },
];

test('index page with layout', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([
    { type: 'h1', props: {}, children: ['Layout'] },
    { type: 'h1', props: {}, children: ['Index Page'] },
    '/',
  ]);
});

test('layout no component', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/layout-no-component/foo']}>
      {renderRoutes(routes)}
    </MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([
    { type: 'h1', props: {}, children: ['Index Page'] },
    '/layout-no-component/foo',
  ]);
});

test('dynamic route params', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/users/123']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([{ type: 'h1', props: {}, children: ['Users Page'] }, '123']);
});

test('redirect', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/redirect']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual({
    type: 'h1',
    props: {},
    children: ['Redirect Page'],
  });
});

test('bigfish compatible', () => {
  window.__UMI_BIGFISH_COMPAT = true;
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/bigfishParams/123']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([{ type: 'h1', props: {}, children: ['BigfishParams Page'] }, '123']);
  window.__UMI_BIGFISH_COMPAT = false;
});

xtest('bigfish compatible with Routes', () => {
  window.__UMI_BIGFISH_COMPAT = true;
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/bigfishParamsWithRoutes/123']}>
      {renderRoutes(routes)}
    </MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([
    { type: 'h1', props: {}, children: ['BigfishRoute: ', '123'] },
    { type: 'h1', props: {}, children: ['BigfishParams Page'] },
    '123',
  ]);
  window.__UMI_BIGFISH_COMPAT = false;
});

test('Routes', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/test-Routes']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([
    { type: 'h1', props: {}, children: ['Need Login'] },
    { type: 'h1', props: {}, children: ['Route'] },
  ]);
});

test('Multiple Routes', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/test-Routes-multiple']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual([
    { type: 'h1', props: {}, children: ['Need Login'] },
    { type: 'h1', props: {}, children: ['Need Confirm'] },
    { type: 'h1', props: {}, children: ['Route'] },
  ]);
});

test('pass props from layout to child routes', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/pass-props-from-layout']}>
      {renderRoutes(routes)}
    </MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual({
    type: 'h1',
    props: {},
    children: ['PassPropsRouteComponent: ', 'test'],
  });
});

test('fallback routes', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/test-fallback-xxx']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual({
    type: 'h1',
    props: {},
    children: ['Fallback'],
  });
});

xtest('patch with g_plugins', () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/g_plugins']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual({
    type: 'h1',
    props: {},
    children: ['foo: ', 'bar'],
  });
});

// TODO: 验证 initial props
test('get intiial props', async () => {
  const tr = TestRenderer.create(
    <MemoryRouter initialEntries={['/get-initial-props']}>{renderRoutes(routes)}</MemoryRouter>,
  );
  expect(tr.toJSON()).toEqual({
    type: 'h1',
    props: {},
    children: null,
  });
});
