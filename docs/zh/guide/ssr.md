---
sidebarDepth: 3
---

# 服务端渲染（SSR）

<Badge text="Support in 2.8.0+"/>

<!-- [[toc]] -->

## 介绍

### 什么是服务端渲染

服务端渲染（Server-Side Render），是指将单页应用（SPA）在**服务器端**渲染为 HTML 片段，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

@startuml
actor "用户/爬虫" as user
participant "服务器" as server

user -> server : 访问 / 链接
server -> server: 服务端渲染
server -> user: <div id="root">\n...content...\n</div>

@enduml

### 与客户端渲染的区别

> 后续简称服务端渲染为 SSR，客户端渲染为 CSR

如下图所示：

@startuml
'skinparam handwritten true
'default
top to bottom direction
actor "用户/爬虫" as user
' centered
cloud "服务器渲染（SSR）" as ssr
' centered
cloud "客户端渲染（CSR）" as csr
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

SSR 优势在于：

- **更友好的 SEO**：爬虫可以直接抓取渲染之后的页面，CSR 首次返回的 HTML 文档中，是空节点（root），不包含内容。而 SSR 返回渲染之后的 HTML 片段，内容完整，所以能更好地被爬虫分析与索引。
- **更快的首屏加载速度**：无需等待 JavaScript 完成下载且执行才显示内容，更快速地看到完整渲染的页面。有更好的用户体验。
- 需要服务端支持：Umijs 主要关注是应用 **UI 层渲染**，完成 SSR 需要服务端（例如：Node.js）支持。

### Umi SSR 特性

- [x] 服务端框架无关
- [x] 支持 CSS Modules
- [x] 支持 TypeScript
- [x] 支持本地开发 HMR
- [x] 支持 dva
- [ ] 支持 Serverless

## 使用

### umi 配置

在[配置文件](/zh/guide/config.html#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)开启 `ssr: true`，[更多配置](/zh/config/#ssr)：

```js
export default {
  ssr: true,
};
```

开启后，运行 `umi build`，会生成如下文件：

```bash
.
├── dist
│   ├── index.html
│   ├── ssr-client-mainifest.json
│   ├── umi.css
│   ├── umi.js
│   └── umi.server.js
```

### 服务端

由于与服务端框架无关，Umijs 关注是应用 **UI 层渲染**，与服务端框架不耦合。

为了降低服务端框架接入门槛，umi 提供 [umi-server](https://npmjs.com/package/umi-server)，并以常见的 Node.js 服务端框架（[Koajs](https://koajs.com)、[Express](https://expressjs.com/)、[Egg.js](https://eggjs.org/)）为例，给出具体接入方式。

#### 直接使用

用 Node.js 原生 [http](http://nodejs.cn/api/http.html#http_http) 模块做服务端渲染。

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

运行 `node bar.js`，访问 [http://localhost:3000](http://localhost:3000)，就是一个简单的服务端渲染例子。

![image](https://user-images.githubusercontent.com/13595509/67446985-0e069700-f645-11e9-85c6-b2ce7f977f74.png)

#### Koa.js

可参考 [umi-example-ssr/blob/master/server.js](https://github.com/umijs/umi-example-ssr/blob/master/server.js)


#### Egg.js

[umi-example-ssr-with-egg/app/controller/home.js](https://github.com/umijs/umi-example-ssr-with-egg/blob/master/app/controller/home.js)

## 配置及插件

## FAQ

### 与预渲染的区别
预渲染（Pre Render）在构建时执行渲染，将渲染后的 HTML 片段生成静态 html 文件。

无需使用 web 服务器实时动态编译 HTML，**适用于静态站点**。

你可以参考 umi 的官方示例 [umi-example-ssr](https://github.com/umijs/umi-example-ssr) 了解更多。
