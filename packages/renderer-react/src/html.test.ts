import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getClientCssPaths, Html } from './html';

test('getClientCssPaths returns umi.css when available', () => {
  expect(
    getClientCssPaths({
      assets: {
        'umi.css': '/umi.css',
        'page.css': '/page.css',
      },
    }),
  ).toEqual(['/umi.css']);
});

test('getClientCssPaths supports utoopack css asset names', () => {
  expect(
    getClientCssPaths({
      assets: {
        'umi.js': '/umi.js',
        'src_pages_c700bf89.css': '/src_pages_c700bf89.css',
        'src_pages_index_css_b574e1f9.async.js.single.css':
          '/src_pages_index_css_b574e1f9.async.js.single.css',
        'src_pages_c700bf89.css.map': '/src_pages_c700bf89.css.map',
      },
    }),
  ).toEqual(['/src_pages_c700bf89.css']);
});

test('getClientCssPaths keeps multiple client css assets', () => {
  expect(
    getClientCssPaths({
      assets: {
        'a.css': '/a.css',
        'b.css': '/b.css',
      },
    }),
  ).toEqual(['/a.css', '/b.css']);
});

test('renders configured stylesheet objects alongside string styles', () => {
  const css = 'p::before { content: "SSR & CSS"; }';
  const html = renderToStaticMarkup(
    React.createElement(Html, {
      htmlPageOpts: {
        styles: [
          {
            src: '/print.css',
            media: 'print',
            crossorigin: 'anonymous',
            'data-origin': 'config',
            children: 'ignored',
          },
          {
            content: css,
            media: 'screen',
            nonce: 'css-nonce',
            dangerouslySetInnerHTML: 'ignored',
          },
          '/base.css',
          'body { margin: 0; }',
        ],
      },
    }),
  );
  const head = html.split('</head>')[0];
  expect(head).toContain(
    '<link media="print" crossorigin="anonymous" data-origin="config" rel="stylesheet" href="/print.css"/>',
  );
  expect(head).toContain(
    `<style media="screen" nonce="css-nonce">${css}</style>`,
  );
  expect(head).not.toContain('ignored');
  expect(head).toContain('href="/base.css"');
  expect(head).toContain('<style>body { margin: 0; }</style>');
});

test('preserves CSS text that includes the style tag delimiter', () => {
  const html = renderToStaticMarkup(
    React.createElement(Html, {
      htmlPageOpts: { styles: ['p::before { content: "</StYlE>"; }'] },
    }),
  );
  expect(html).toContain(
    String.raw`<style>p::before { content: "</\53 tYlE>"; }</style>`,
  );
});

test('serializes every hydration value safely inside the script element', () => {
  const loaderData = { page: { text: 'a < b\u2028c > d\u2029' } };
  const htmlPageOpts = { title: 'Tea < Coffee & Cake' };
  const cssPaths = ['/site.css?size=<small>', '/page.css'];
  const html = renderToStaticMarkup(
    React.createElement(Html, {
      loaderData,
      htmlPageOpts,
      manifest: { assets: { 'umi.css': cssPaths } },
    }),
  );
  const script = html.match(/<script>([^<]*)<\/script>/)?.[1];
  expect(script).toBe(
    [
      String.raw`window.__UMI_LOADER_DATA__ = {"page":{"text":"a \u003c b\u2028c > d\u2029"}}`,
      String.raw`window.__UMI_METADATA_LOADER_DATA__ = {"title":"Tea \u003c Coffee & Cake"}`,
      String.raw`window.__UMI_BUILD_ClIENT_CSS__ = ["/site.css?size=\u003csmall>","/page.css"]`,
    ].join('; '),
  );
});
