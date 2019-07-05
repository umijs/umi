
import { existsSync } from 'fs';
import { join } from 'path';

export default async function ({ page, host }) {

  const ssrFile = join(__dirname, 'dist', 'umi.server.js');
  expect(existsSync(ssrFile)).toBeTruthy();

  const serverRender = require('./dist/umi.server');
  // export react-dom/server to avoid React hooks ssr error
  const { ReactDOMServer } = serverRender;

  const ctx = {
    req: {
      url: '/',
    },
  };

  global.window = {};
  const { rootContainer } = await serverRender.default(ctx);
  const ssrHtml = ReactDOMServer.renderToString(rootContainer);

  expect(ssrHtml).toContain('Hello UmiJS SSR');
  expect(ssrHtml).toContain('<ul><li>Alice</li><li>Jack</li><li>Tony</li></ul>');

};
