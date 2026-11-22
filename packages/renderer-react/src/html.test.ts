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
  const html = renderToStaticMarkup(
    React.createElement(Html, {
      htmlPageOpts: {
        styles: [
          { src: '/print.css', media: 'print' },
          { content: 'p { color: green; }', media: 'screen' },
          '/base.css',
          'body { margin: 0; }',
        ],
      },
    }),
  );
  const head = html.split('</head>')[0];
  expect(head).toMatch(/<link[^>]*href="\/print\.css"[^>]*>/);
  expect(head).toContain('media="print"');
  expect(head).toContain('<style media="screen">p { color: green; }</style>');
  expect(head).toContain('href="/base.css"');
  expect(head).toContain('<style>body { margin: 0; }</style>');
});
