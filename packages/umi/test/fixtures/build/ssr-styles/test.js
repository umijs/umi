
import { existsSync } from 'fs';
import { join } from 'path';
import { winPath } from 'umi-utils'
import rimraf from 'rimraf';

const getServerRender = async (url) => {

  const serverRender = require('./dist/umi.server');
  // export react-dom/server to avoid React hooks ssr error
  const { ReactDOMServer } = serverRender;

  const ctx = {
    req: {
      url,
    },
  };

  global.window = {};
  const { rootContainer, htmlElement, matchPath } = await serverRender.default(ctx);
  const ssrHtml = ReactDOMServer.renderToString(rootContainer);
  const ssrHtmlElement = ReactDOMServer.renderToString(htmlElement);

  return {
    ssrHtml,
    ssrHtmlElement,
    matchPath,
  }
}

export default async function ({ page, host }) {

  const ssrFile = join(winPath(__dirname), 'dist', 'umi.server.js');
  const manifestFile = join(winPath(__dirname), 'dist', 'ssr-client-mainifest.json');
  const manifest = require('./dist/ssr-client-mainifest.json');
  expect(existsSync(ssrFile)).toBeTruthy();
  expect(existsSync(manifestFile)).toBeTruthy();
  expect(manifest).toEqual({
    '/': {
      js: ['umi.js'],
      css: ['umi.css'],
    },
    '/news': {
      js: ['umi.js'],
      css: ['umi.css'],
    },
  });

  const { ssrHtml, ssrHtmlElement, matchPath } = await getServerRender('/');
  expect(matchPath).toBe('/');
  expect(ssrHtml).toEqual(
    '<div class="wrapper" data-reactroot=""><h1>Hello UmiJS SSR Styles</h1><ul><li>Alice</li><li>Jack</li><li>Tony</li></ul><button>0</button></div>',
  );

  // dynamic render
  const { ssrHtml: newsHtml, matchPath: newsMatchPath } = await getServerRender('/news');

  expect(newsMatchPath).toBe('/news')

  expect(newsHtml).toContain(
    '<div class="news" data-reactroot=""><h1>Hello UmiJS SSR Styles</h1></div>',
  );

  rimraf.sync(join(winPath(__dirname), 'dist/'))

};
