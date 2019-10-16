# umi-server

A runtime render tool for Umijs Server-Side Rendering.

## Quick Start

(config + ctx) => htmlString

```sh
npm install umi-server -S
```

```js
const server = require('umi-server');
const { join } = require('path');

const render = server({
  root: join(__dirname, 'dist'),
  publicPath: '/',
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

## Usage

The type definition:

```js
interface IConfig {
  /** dist path */
  root: string;
  /** static assets publicPath */
  publicPath: string;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** default false */
  polyfill?: boolean;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** handler function for user to modify render html */
  postProcessHtml?: IHandler;
  /** TODO: serverless */
  serverless?: boolean;
}

type IHandler = (html: string, args: IArgs) => string;
```

more example usages in [test cases](https://github.com/umijs/umi/blob/master/packages/umi-server/test/index.test.ts).
