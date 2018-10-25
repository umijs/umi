import React from 'react';
import TestRenderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { mount, shallow } from 'enzyme';

import renderRoutes from './renderRoutes';

window.__UMI_BIGFISH_COMPAT = false;

describe('renderRoutes', () => {
  function Layout(props) {
    return (
      <>
        <h1>Layout</h1>
        {props.children}
      </>
    );
  }

  function IndexPage(props) {
    return (
      <>
        <h1>Index Page</h1>
        {props.location.pathname}
      </>
    );
  }

  function UsersPage(props) {
    return (
      <>
        <h1>Users Page</h1>
        {props.match.params.userId}
      </>
    );
  }

  function BigfishParams(props) {
    return (
      <>
        <h1>BigfishParams Page</h1>
        {props.params.userId}
      </>
    );
  }

  function Redirect() {
    return <h1>Redirect Page</h1>;
  }

  function NeedLogin({ children }) {
    return (
      <>
        <h1>Need Login</h1>
        {children}
      </>
    );
  }

  function NeedConfirm({ children }) {
    return (
      <>
        <h1>Need Confirm</h1>
        {children}
      </>
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

  function PassPropsRouteComponent(props) {
    return <h1>PassPropsRouteComponent: {props.test || 'null'}</h1>;
  }

  function Fallback() {
    return <h1>Fallback</h1>;
  }

  const routes = [
    {
      path: '/',
      exact: true,
      component: Layout,
      routes: [{ path: '/', exact: true, component: IndexPage }],
    },
    { path: '/users/:userId', exact: true, component: UsersPage },
    { path: '/bigfishParams/:userId', exact: true, component: BigfishParams },
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
      routes: [
        { path: '/pass-props-from-layout', component: PassPropsRouteComponent },
      ],
    },
    { component: Fallback },
  ];

  test('index page with layout', () => {
    const tr = TestRenderer.create(
      <MemoryRouter initialEntries={['/']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
    );
    expect(tr.toJSON()).toEqual([
      { type: 'h1', props: {}, children: ['Layout'] },
      { type: 'h1', props: {}, children: ['Index Page'] },
      '/',
    ]);
  });

  test('dynamic route params', () => {
    const tr = TestRenderer.create(
      <MemoryRouter initialEntries={['/users/123']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
    );
    expect(tr.toJSON()).toEqual([
      { type: 'h1', props: {}, children: ['Users Page'] },
      '123',
    ]);
  });

  test('redirect', () => {
    const tr = TestRenderer.create(
      <MemoryRouter initialEntries={['/redirect']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
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
      <MemoryRouter initialEntries={['/bigfishParams/123']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
    );
    expect(tr.toJSON()).toEqual([
      { type: 'h1', props: {}, children: ['BigfishParams Page'] },
      '123',
    ]);
    window.__UMI_BIGFISH_COMPAT = false;
  });

  test('Routes', () => {
    const tr = TestRenderer.create(
      <MemoryRouter initialEntries={['/test-Routes']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
    );
    expect(tr.toJSON()).toEqual([
      { type: 'h1', props: {}, children: ['Need Login'] },
      { type: 'h1', props: {}, children: ['Route'] },
    ]);
  });

  test('Multiple Routes', () => {
    const tr = TestRenderer.create(
      <MemoryRouter initialEntries={['/test-Routes-multiple']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
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
      <MemoryRouter initialEntries={['/test-fallback-xxx']}>
        {renderRoutes(routes)}
      </MemoryRouter>,
    );
    expect(tr.toJSON()).toEqual({
      type: 'h1',
      props: {},
      children: ['Fallback'],
    });
  });
});
