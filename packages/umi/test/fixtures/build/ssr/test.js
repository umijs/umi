
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
    "/": {
      "css": [],
      "js": [
        "umi.js",
      ],
    },
    "/news/:id": {
      "css": [],
      "js": [
        "umi.js",
      ],
    },
  });

  const { ssrHtml, ssrHtmlElement, matchPath } = await getServerRender('/');
  expect(matchPath).toBe('/');
  expect(ssrHtml).toContain(`<div class=\"wrapper\" data-reactroot=\"\"><h1>Hello UmiJS SSR</h1><ul><li>Alice</li><li>Jack</li><li>Tony</li></ul><button>0</button></div>`);

  expect(ssrHtmlElement).toContain(`<script>window.g_useSSR=true;
  window.g_initialData = {\"list\":[{\"name\":\"Alice\"},{\"name\":\"Jack\"},{\"name\":\"Tony\"}]};</script><script>window.routerBase = \"/\";</script></head><body><div id=\"root\"><div class=\"wrapper\"><h1>Hello UmiJS SSR</h1><ul><li>Alice</li><li>Jack</li><li>Tony</li></ul><button>0</button></div></div><script src=\"/umi.js\"></script>`);


  // dynamic render
  const { ssrHtml: newsHtml, ssrHtmlElement: newsHtmlElement, matchPath: newsMatchPath } = await getServerRender('/news/1');

  expect(newsMatchPath).toBe('/news/:id')

  expect(newsHtml).toContain(`<div class=\"newsWrapper\" data-reactroot=\"\"><p>1<!-- -->_<!-- -->hello</p></div>`);
  expect(newsHtmlElement).toContain(`<script>window.g_useSSR=true;
  window.g_initialData = {\"id\":1,\"name\":\"hello\"};</script><script>window.routerBase = \"/\";</script></head><body><div id=\"root\"><div class=\"newsWrapper\"><p>1<!-- -->_<!-- -->hello</p></div></div><script src=\"/umi.js\"></script>`);

  const { ssrHtml: newsHtml2, ssrHtmlElement: newsHtmlElement2 } = await getServerRender('/news/2');

  expect(newsHtml2).toContain(`<div class=\"newsWrapper\" data-reactroot=\"\"><p>2<!-- -->_<!-- -->world</p></div>`);
  expect(newsHtmlElement2).toContain(`<script>window.g_useSSR=true;
  window.g_initialData = {\"id\":2,\"name\":\"world\"};</script><script>window.routerBase = \"/\";</script></head><body><div id=\"root\"><div class=\"newsWrapper\"><p>2<!-- -->_<!-- -->world</p></div></div><script src=\"/umi.js\"></script>`);

  rimraf.sync(join(winPath(__dirname), 'dist/'))

};
