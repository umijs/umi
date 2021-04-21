import React from 'react';
import { Stream } from 'stream';
import { Plugin } from '@umijs/runtime';
import renderServer from './renderServer';

test('renderServer normal', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });
  const serverResult = await renderServer({
    path: '/foo',
    plugin,
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  });
  expect(serverResult.pageHTML).toEqual(
    '<div data-reactroot=""><h1>foo</h1></div>',
  );

  const serverResultBar = await renderServer({
    path: '/bar',
    plugin,
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  });
  expect(serverResultBar.pageHTML).toEqual(
    '<div data-reactroot=""><h1>bar</h1></div>',
  );
});

test('renderServer layout', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return container;
      },
    },
    path: '/foo',
  });
  let execFlag = false;
  class Layout extends React.Component<{ titleLayout: string; title: string }> {
    static async getInitialProps(ctx: any) {
      execFlag = true;
      ctx.layout = 'layoutCtx';
      return {
        title: 'layout',
        titleLayout: 'titleLayout',
      };
    }

    render() {
      return (
        <div>
          <h1>{`${execFlag}`}</h1>
          <h2>{this.props.titleLayout}</h2>
          <h3>{this.props.title}</h3>
          {this.props.children}
        </div>
      );
    }
  }
  class Foo extends React.Component<{ layout: string; title: string }> {
    static async getInitialProps(ctx: any) {
      return {
        layout: ctx.layout,
        title: 'foo',
      };
    }
    render() {
      return (
        <>
          <h4>{this.props.title}</h4>
          <h5>{this.props.layout}</h5>
        </>
      );
    }
  }

  const serverResult = await renderServer({
    path: '/foo',
    plugin,
    routes: [
      {
        path: '/',
        component: Layout,
        routes: [{ path: '/foo', component: Foo }],
      },
    ],
  });
  expect(serverResult.pageHTML).toEqual(
    '<div><h1>true</h1><h2>titleLayout</h2><h3>foo</h3><h4>foo</h4><h5>layoutCtx</h5></div>',
  );
});

test('renderServer getInitialProps', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  class Foo extends React.Component<{ foo: string }> {
    static async getInitialProps() {
      return {
        foo: 'foo',
      };
    }
    render() {
      return <h1>{this.props.foo}</h1>;
    }
  }

  class Bar extends React.Component<{ bar: string }> {
    static async getInitialProps() {
      return {
        bar: 'bar',
      };
    }
    render() {
      return <h1>{this.props.bar}</h1>;
    }
  }
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });
  const serverResult = await renderServer({
    path: '/foo',
    plugin,
    pathname: '/foo',
    routes: [
      { path: '/foo', component: Foo },
      { path: '/bar', component: Bar },
    ],
  });
  expect(serverResult.pageHTML).toEqual(
    '<div data-reactroot=""><h1>foo</h1></div>',
  );

  const serverResultBar = await renderServer({
    path: '/bar',
    plugin,
    pathname: '/bar',
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  });
  expect(serverResultBar.pageHTML).toEqual(
    '<div data-reactroot=""><h1>bar</h1></div>',
  );
});

test.skip('renderServer wrapper getInitialProps', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });

  class Wrapper extends React.Component {
    static async getInitialProps(ctx: any) {
      const store = {
        name: 'foo',
      };
      ctx.store = store;
      return {
        store,
      };
    }

    render() {
      const { children, ...restProps } = this.props;
      return React.cloneElement(<>{children}</>, restProps);
    }
  }

  class Foo extends React.Component<{
    name: string;
    store: any;
  }> {
    static async getInitialProps(ctx: any) {
      return {
        name: ctx.store?.name,
      };
    }
    render() {
      return (
        <div>
          <h1>{this.props.name}</h1>
          <h2>{this.props.store?.name}</h2>
        </div>
      );
    }
  }

  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return React.createElement(Wrapper, null, container);
      },
    },
    path: '/foo',
  });
  const serverResult = await renderServer({
    path: '/foo',
    plugin,
    pathname: '/foo',
    routes: [{ path: '/foo', component: Foo }],
  });
  expect(serverResult.pageHTML).toEqual('<div><h1>foo</h1><h2>foo</h2></div>');
});

test('renderServer staticMarkup', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });

  const serverResultStatic = await renderServer({
    path: '/foo',
    plugin,
    staticMarkup: true,
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  });
  expect(serverResultStatic.pageHTML).toEqual('<div><h1>foo</h1></div>');

  const serverResultBar = await renderServer({
    path: '/bar',
    plugin,
    staticMarkup: true,
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  });
  expect(serverResultBar.pageHTML).toEqual('<div><h1>bar</h1></div>');
});

test('renderServer stream', (done) => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return <div>{container}</div>;
      },
    },
    path: '/foo',
  });

  renderServer({
    path: '/foo',
    plugin,
    mode: 'stream',
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
    ],
  }).then(({ pageHTML }) => {
    const expectBytes = Buffer.from(
      '<div data-reactroot=""><h1>foo</h1></div>',
    );
    let bytes = Buffer.from('');
    expect(pageHTML instanceof Stream).toBeTruthy();
    (pageHTML as Stream).on('data', (chunk) => {
      bytes = Buffer.concat([bytes, chunk]);
    });
    (pageHTML as Stream).on('end', () => {
      expect(bytes).toEqual(expectBytes);
      done();
    });
  });
});

test('renderServer plugin modifyGetInitialPropsCtx', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange', 'rootContainer', 'ssr'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
      rootContainer(container: any) {
        return <div>{container}</div>;
      },
      ssr: {
        modifyGetInitialPropsCtx: async (ctx: any) => {
          ctx.title = 'Hello SSR';
          return ctx;
        },
      },
    },
    path: '/foo',
  });

  plugin.register({
    apply: {
      ssr: {
        modifyGetInitialPropsCtx: async (ctx: any) => {
          ctx.desc = 'Hello Desc';
          return ctx;
        },
      },
    },
    path: '/bar',
  });

  plugin.register({
    apply: {
      ssr: {
        modifyGetInitialPropsCtx: async (ctx: any) => {
          // not return
          ctx.notReturn = 'Hello notReturn';
        },
      },
    },
    path: '/bar',
  });

  const Foo: React.FC<{ title: string; desc: string }> & {
    getInitialProps: (props: any) => any;
  } = (props) => {
    return (
      <h1>
        {props.title}，{props.desc}
      </h1>
    );
  };
  Foo.getInitialProps = async (ctx) => {
    return {
      title: ctx.title,
      desc: ctx.desc,
    };
  };

  const serverResult = await renderServer({
    path: '/foo',
    plugin,
    staticMarkup: true,
    routes: [{ path: '/foo', component: Foo }],
  });
  expect(serverResult.pageHTML).toEqual(
    '<div><h1>Hello SSR，Hello Desc</h1></div>',
  );
});
