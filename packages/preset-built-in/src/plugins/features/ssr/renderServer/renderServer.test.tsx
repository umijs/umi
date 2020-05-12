import React from 'react';
import { Stream, Writable, Readable } from 'stream';
import { Plugin } from '@umijs/runtime';
import renderServer from './renderServer';

test('normal', async () => {
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

test('ssr staticMarkup', async () => {
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

test('ssr stream', (done) => {
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
    const expectBytes = new Buffer('<div data-reactroot=""><h1>foo</h1></div>');
    let bytes = new Buffer('');
    expect(pageHTML instanceof Stream).toBeTruthy();
    pageHTML.on('data', (chunk) => {
      bytes = Buffer.concat([bytes, chunk]);
    });
    pageHTML.on('end', () => {
      expect(bytes).toEqual(expectBytes);
      done();
    });
  });
});
