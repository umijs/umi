---
sidebarDepth: 3
---

# Server-side render

<Badge text="Support in 2.8.0+"/>

<!-- [[toc]] -->

## Introduction

### What is server-side render?

Server-Side Render means that a single-page application (SPA) is rendered as an HTML fragment on the server side, sent to the browser, and then bound to the state and events to become a fully interactive page. the process of.

@startuml
actor "User/Crawler" as user
participant "Server" as server

user -> server : Access
server -> server: server-side render
server -> user: <div id="root">\n...content...\n</div>

@enduml

### Differences from CSR(Client-Side render)

> Subsequently referred to as server-side render as SSR, client-side render as CSR

As shown below:

@startuml
'skinparam handwritten true
'default
top to bottom direction
actor "User/Crawler" as user
' centered
cloud "SSR" as ssr
' centered
cloud "CSR" as csr
user <--> (ssr)
user <--> (csr)

note left of (user)
  <div id="root">
    ...<div>content</div>...
  </div>
end note

note right of (user)
  <div id="root"></div>
end note

@enduml

The advantages of SSR are:

- **More friendly SEO** : The crawler can directly grab the rendered page. The first time the CSR returns the HTML document, it is an empty node (root) and contains no content. The SSR returns the HTML fragment after rendering, the content is complete, so it can be better analyzed and indexed by the crawler.
- **Faster first screen loading speed**: Show content without waiting for JavaScript to complete the download and execution, and see the fully rendered page faster. Have a better user experience.
- Requires server support: Umijs focuses on application **UI layer rendering**, and SSR requires server (eg Node.js) support.

### Umi SSR features

- [x] Server framework is not relevant
- [x] Support CSS Modules
- [x] Support TypeScript
- [x] Support local development HMR
- [x] Support dva
- [ ] Support Serverless

## Usage

### umi configuration

Turn on `ssr: true` in [config file](/guide/config.html#configuration-file), [more Configuration](/config/#ssr):

```js
export default {
  ssr: true,
};
```

After enable, running `umi build` will generate the following files:

```bash
.
├── dist
│   ├── index.html
│   ├── ssr-client-mainifest.json
│   ├── umi.css
│   ├── umi.js
│   └── umi.server.js
```

### Server-Side

Regardless of the server-side framework, Umijs focuses on application **UI layer rendering**, which is not coupled to the server-side framework.

In order to reduce the server framework access threshold, umi provides [umi-server](https://npmjs.com/package/umi-server) and uses the common Node.js server framework ([Koajs](https://koajs.com), [Express](https://expressjs.com/), [Egg.js](https://eggjs.org/)), for example, give specific access methods.

#### Use http module

Use the Node.js native [http](http://nodejs.org/api/http.html#http_http) module to do server-side rendering.

```js
// bar.js
const server = require('umi-server');
const http = require('http');
const { createReadStream } = require('fs');
const { join, extname } = require('path');

const root = join(__dirname, 'dist');
const render = server({
  root,
})
const headerMap = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.png': 'image/jpeg',
}

http.createServer(async (req, res) => {
  const ext = extname(req.url);
  const header = {
    'Content-Type': headerMap[ext] || 'text/html'
  }
  res.writeHead(200, header);

  if (!ext) {
    // url render
    const ctx = {
      req,
      res,
    }
    const { ssrHtml } = await render(ctx);
    res.write(ssrHtml);
    res.end()
  } else {
    // static file url
    const path = join(root, req.url);
    const stream = createReadStream(path);
    stream.on('error', (error) => {
      res.writeHead(404, 'Not Found');
      res.end();
    });
    stream.pipe(res);
  }

}).listen(3000)

console.log('http://localhost:3000');
```

Running `node bar.js` and accessing [http://localhost:3000](http://localhost:3000) is a simple example of server-side rendering.

![image](https://user-images.githubusercontent.com/13595509/67446985-0e069700-f645-11e9-85c6-b2ce7f977f74.png)

#### Koa.js

refer to [examples/koajs](https://github.com/umijs/umi-server/tree/master/examples/koajs)


#### Egg.js

refer to [examples/eggjs](https://github.com/umijs/umi-server/tree/master/examples/eggjs)

### Pre Render

Pre Render performs rendering at build time, and renders the rendered HTML snippet into a static html file. No need to use a web server to dynamically compile HTML in real time, **for static sites**.

Umi provides the [@umijs/plugin-prerender](https://github.com/umijs/umi-server/tree/master/packages/umi-plugin-prerender) plugin to help users pre-render the page at build time. For more usage, please refer to [documentation](https://github.com/umijs/umi-server/tree/master/packages/umi-plugin-prerender).

```js
export default {
  plugins: [['@umijs/plugin-prerender', options]],
};
```

### Problems

see [FAQ](https://umijs.org/guide/faq.html#ssr)
