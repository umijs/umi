# umi-server

A render tool for Umijs Server-Side Rendering.

## Quick Start

(config + ctx) => htmlString

```sh
npm install umi-server -S
```

```js
const server = require('umi-server');

const render = server({
  cwd: process.cwd(),
  serverFile: './dist/umi.server',
  manifestFileName: './dist/ssr-client-mainifest.json',
  publicPath: '/',
  // default set false, maybe breakChange
  polyfill: false,
  // use renderToStaticMarkup, default renderToString
  staticMarkup: false,
  postProcessHtml: () => {},
  // TODO: serverless
  serverless: true,
})

// your server
http.createServer(async (req, res) => {
  const ctx = {
    req,
    res,
  }
  const {
    // root string
    ssrHtml,
    // all string
    ssrHtmlElement,
    matchPath,
    styles,
  } = await render(ctx);
  res.write(ssrHtmlElement);
})
```

Static Server:

```bash
$ npm install umi-server -g
$ umi-server
```
